import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  validateCreateGame,
  validateUpdateGame,
  validateNearbyGames,
  validateGameFilters,
  validateUUIDParam,
  handleValidationErrors
} from '../middleware/validation';
import { modifyLimiter, userGameLimiter } from '../middleware/rateLimiter';
import { prisma } from '../lib/prisma';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface CreateGameRequest {
  locationId: string;
  title: string;
  scheduledTime: string;
  duration: number;
  maxPlayers: number;
  skillLevel?: string;
  description?: string;
}

interface JoinGameRequest {
  gameId: string;
}

// Get nearby games
router.get('/nearby', validateNearbyGames, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusKm = parseInt(radius as string);

    // Using Haversine formula for distance calculation
    const games = await prisma.$queryRaw`
      SELECT g.*, l.*, 
        (6371 * acos(cos(radians(${latitude})) * cos(radians(l.latitude)) * 
        cos(radians(l.longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * sin(radians(l.latitude)))) AS distance
      FROM "Game" g
      JOIN "Location" l ON g."locationId" = l.id
      WHERE g.status = 'scheduled'
      HAVING distance <= ${radiusKm}
      ORDER BY distance ASC
    `;

    res.json(games);
  } catch (error) {
    console.error('Error fetching nearby games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all games
router.get('/', validateGameFilters, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { locationId, status, skillLevel } = req.query;
    
    const where: any = {};
    
    if (locationId) {
      where.locationId = locationId as string;
    }
    
    if (status) {
      where.status = status as string;
    }
    
    if (skillLevel) {
      where.skillLevel = skillLevel as string;
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        location: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                skillLevel: true,
              }
            }
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    // Update currentPlayers count
    const gamesWithCount = games.map(game => ({
      ...game,
      currentPlayers: game._count?.participants || 0
    }));

    res.json(gamesWithCount);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get game by ID
router.get('/:id', validateUUIDParam('id'), handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        location: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                skillLevel: true,
              }
            }
          }
        }
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Update currentPlayers count
    const gameWithCount = {
      ...game,
      currentPlayers: game.participants.length
    };

    res.json(gameWithCount);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new game (requires authentication)
router.post('/', userGameLimiter, validateCreateGame, handleValidationErrors, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { locationId, title, scheduledTime, duration, maxPlayers, skillLevel, description } = req.body as CreateGameRequest;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!locationId || !title || !scheduledTime || !duration || !maxPlayers) {
      return res.status(400).json({ error: 'locationId, title, scheduledTime, duration, and maxPlayers are required' });
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Verify scheduled time is in the future
    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const game = await prisma.game.create({
      data: {
        locationId,
        title,
        creatorId: req.user.id,
        scheduledAt: scheduledDate,
        duration,
        maxPlayers,
        skillLevel,
        description,
      },
      include: {
        location: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    // Automatically add creator as participant
    await prisma.gameParticipant.create({
      data: {
        gameId: game.id,
        userId: req.user.id,
        status: 'confirmed'
      }
    });

    // Update current players count
    await prisma.game.update({
      where: { id: game.id },
      data: { currentPlayers: 1 }
    });

    res.status(201).json({
      message: 'Game created successfully',
      game
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a game (requires authentication)
router.post('/:id/join', userGameLimiter, validateUUIDParam('id'), handleValidationErrors, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: gameId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'scheduled') {
      return res.status(400).json({ error: 'Cannot join a game that is not scheduled' });
    }

    if (game.participants.length >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Check if user already has an active game
    const existingActiveGame = await prisma.game.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: req.user!.id,
                status: 'joined'
              }
            }
          },
          {
            status: {
              in: ['scheduled', 'starting', 'active']
            }
          },
          {
            scheduledAt: {
              gte: new Date(Date.now() - 3 * 60 * 60 * 1000)
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true
      }
    });

    if (existingActiveGame) {
      return res.status(400).json({ 
        error: 'You can only participate in one game at a time',
        activeGame: existingActiveGame
      });
    }

    // Check if user is already a participant in this specific game
    const existingParticipant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId: req.user!.id
        }
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'You are already participating in this game' });
    }

    // Add user as participant and update count atomically
    await prisma.$transaction(async (tx) => {
      // Double-check availability within transaction
      const currentParticipants = await tx.gameParticipant.count({
        where: { gameId }
      });

      if (currentParticipants >= game.maxPlayers) {
        throw new Error('Game is full');
      }

      // Add user as participant
      await tx.gameParticipant.create({
        data: {
          gameId,
          userId: req.user!.id,
          status: 'confirmed'
        }
      });

      // Update current players count
      await tx.game.update({
        where: { id: gameId },
        data: { currentPlayers: currentParticipants + 1 }
      });
    });

    res.json({ message: 'Successfully joined the game' });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave a game (requires authentication)
router.post('/:id/leave', userGameLimiter, validateUUIDParam('id'), handleValidationErrors, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: gameId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is a participant
    const participant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId: req.user!.id
        }
      }
    });

    if (!participant) {
      return res.status(400).json({ error: 'You are not participating in this game' });
    }

    // Remove participant and update count atomically
    await prisma.$transaction(async (tx) => {
      // Remove participant
      await tx.gameParticipant.delete({
        where: {
          gameId_userId: {
            gameId,
            userId: req.user!.id
          }
        }
      });

      // Update current players count
      const participantCount = await tx.gameParticipant.count({
        where: { gameId }
      });

      await tx.game.update({
        where: { id: gameId },
        data: { currentPlayers: participantCount }
      });
    });

    res.json({ message: 'Successfully left the game' });
  } catch (error) {
    console.error('Error leaving game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update game (requires authentication and ownership)
router.put('/:id', validateUpdateGame, handleValidationErrors, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, scheduledTime, duration, maxPlayers, skillLevel, description, status } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const existingGame = await prisma.game.findUnique({
      where: { id }
    });

    if (!existingGame) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (existingGame.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only update your own games' });
    }

    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (scheduledTime) {
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'Scheduled time must be in the future' });
      }
      updateData.scheduledAt = scheduledDate;
    }
    
    if (duration) updateData.duration = duration;
    if (maxPlayers) updateData.maxPlayers = maxPlayers;
    if (skillLevel) updateData.skillLevel = skillLevel;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;

    const game = await prisma.game.update({
      where: { id },
      data: updateData,
      include: {
        location: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Game updated successfully',
      game
    });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete game (requires authentication and ownership)
router.delete('/:id', validateUUIDParam('id'), handleValidationErrors, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const existingGame = await prisma.game.findUnique({
      where: { id }
    });

    if (!existingGame) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (existingGame.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own games' });
    }

    await prisma.game.delete({
      where: { id }
    });

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;