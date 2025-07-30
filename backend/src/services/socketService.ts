import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

interface JoinGameData {
  gameId: string;
}

interface LeaveGameData {
  gameId: string;
}

interface GameUpdateData {
  gameId: string;
  update: {
    currentPlayers?: number;
    status?: string;
    [key: string]: any;
  };
}

export const setupSocketHandlers = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        console.log('Socket connection attempt without token');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Verify user exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, username: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.userEmail = user.email;
      
      console.log(`🔌 User ${user.username} (${user.id}) connected via Socket.IO`);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user to their personal room for notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      console.log(`👤 User ${socket.userId} joined personal room`);
    }

    // Handle joining a game room for real-time updates
    socket.on('join-game', async (data: JoinGameData) => {
      try {
        const { gameId } = data;
        
        // Verify game exists and user has access
        const game = await prisma.game.findUnique({
          where: { id: gameId },
          include: {
            location: true,
            participants: {
              include: {
                user: {
                  select: { id: true, username: true, email: true }
                }
              }
            }
          }
        });

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        socket.join(`game:${gameId}`);
        console.log(`🏀 User ${socket.userId} joined game room: ${gameId}`);

        // Send current game state to the user
        socket.emit('game-state', {
          game: {
            id: game.id,
            title: game.title,
            description: game.description,
            dateTime: game.scheduledAt,
            maxPlayers: game.maxPlayers,
            currentPlayers: game.participants.length,
            status: game.status,
            skillLevel: game.skillLevel,
            location: game.location,
            players: game.participants.map((p: any) => ({
              id: p.user.id,
              username: p.user.username,
              joinedAt: p.joinedAt
            }))
          }
        });

        // Notify other users in the game room
        socket.to(`game:${gameId}`).emit('user-joined-room', {
          userId: socket.userId,
          userEmail: socket.userEmail,
          gameId
        });

      } catch (error) {
        console.error('Error joining game room:', error);
        socket.emit('error', { message: 'Failed to join game room' });
      }
    });

    // Handle leaving a game room
    socket.on('leave-game', (data: LeaveGameData) => {
      const { gameId } = data;
      socket.leave(`game:${gameId}`);
      console.log(`🚪 User ${socket.userId} left game room: ${gameId}`);

      // Notify other users in the game room
      socket.to(`game:${gameId}`).emit('user-left-room', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        gameId
      });
    });

    // Handle real-time chat messages (if implemented)
    socket.on('game-message', async (data: { gameId: string; message: string }) => {
      try {
        const { gameId, message } = data;
        
        // Verify user is part of the game
        const gameParticipant = await prisma.gameParticipant.findFirst({
          where: {
            gameId,
            userId: socket.userId
          },
          include: {
            user: {
              select: { username: true }
            }
          }
        });

        if (!gameParticipant) {
          socket.emit('error', { message: 'You are not part of this game' });
          return;
        }

        const chatMessage = {
          id: Date.now().toString(),
          userId: socket.userId,
          username: gameParticipant.user.username,
          message,
          timestamp: new Date().toISOString()
        };

        // Broadcast message to all users in the game room
        io.to(`game:${gameId}`).emit('game-message', chatMessage);
        console.log(`💬 Message in game ${gameId} from ${gameParticipant.user.username}: ${message}`);

      } catch (error) {
        console.error('Error handling game message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle location sharing for meeting up
    socket.on('share-location', (data: { gameId: string; latitude: number; longitude: number }) => {
      const { gameId, latitude, longitude } = data;
      
      // Broadcast location to game room
      socket.to(`game:${gameId}`).emit('player-location', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      console.log(`📍 User ${socket.userId} shared location in game ${gameId}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data: { gameId: string }) => {
      socket.to(`game:${data.gameId}`).emit('user-typing', {
        userId: socket.userId,
        userEmail: socket.userEmail
      });
    });

    socket.on('typing-stop', (data: { gameId: string }) => {
      socket.to(`game:${data.gameId}`).emit('user-stop-typing', {
        userId: socket.userId,
        userEmail: socket.userEmail
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} (User: ${socket.userId}) - Reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`🚨 Socket error for user ${socket.userId}:`, error);
    });
  });

  // Global functions to emit events from API routes
  const socketService = {
    // Notify when a new game is created
    notifyNewGame: (game: any) => {
      io.emit('new-game-created', {
        game: {
          id: game.id,
          title: game.title,
          location: game.location,
          dateTime: game.scheduledAt,
          maxPlayers: game.maxPlayers,
          currentPlayers: game.participants?.length || 0,
          skillLevel: game.skillLevel
        }
      });
      console.log(`📢 Broadcast: New game created - ${game.title}`);
    },

    // Notify when someone joins a game
    notifyGameJoined: (gameId: string, userId: string, gameData: any) => {
      io.to(`game:${gameId}`).emit('player-joined', {
        gameId,
        userId,
        currentPlayers: gameData.currentPlayers,
        maxPlayers: gameData.maxPlayers,
        playerInfo: gameData.playerInfo
      });
      console.log(`👥 Game ${gameId}: Player ${userId} joined`);
    },

    // Notify when someone leaves a game
    notifyGameLeft: (gameId: string, userId: string, gameData: any) => {
      io.to(`game:${gameId}`).emit('player-left', {
        gameId,
        userId,
        currentPlayers: gameData.currentPlayers,
        maxPlayers: gameData.maxPlayers
      });
      console.log(`👋 Game ${gameId}: Player ${userId} left`);
    },

    // Notify when a game is cancelled
    notifyGameCancelled: (gameId: string, gameData: any) => {
      io.to(`game:${gameId}`).emit('game-cancelled', {
        gameId,
        title: gameData.title,
        reason: gameData.cancellationReason || 'Game was cancelled by the organizer'
      });
      
      // Also notify all players personally
      gameData.participants?.forEach((participant: any) => {
        io.to(`user:${participant.userId}`).emit('game-cancelled-notification', {
          gameId,
          title: gameData.title,
          dateTime: gameData.scheduledAt
        });
      });
      console.log(`🚫 Game ${gameId} cancelled and players notified`);
    },

    // Notify about game updates (time changes, etc.)
    notifyGameUpdated: (gameId: string, updates: any) => {
      io.to(`game:${gameId}`).emit('game-updated', {
        gameId,
        updates,
        timestamp: new Date().toISOString()
      });
      console.log(`🔄 Game ${gameId} updated:`, updates);
    },

    // Send personal notification to a user
    notifyUser: (userId: string, notification: any) => {
      io.to(`user:${userId}`).emit('notification', {
        id: Date.now().toString(),
        ...notification,
        timestamp: new Date().toISOString()
      });
      console.log(`🔔 Notification sent to user ${userId}:`, notification.type);
    }
  };

  return socketService;
};

// Export the socket service instance (will be set when server starts)
export let socketService: ReturnType<typeof setupSocketHandlers>;

// Helper to set the socket service instance
export const setSocketService = (service: ReturnType<typeof setupSocketHandlers>) => {
  socketService = service;
};