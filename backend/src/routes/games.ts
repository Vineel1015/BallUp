import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
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
  scheduledTime: string;
  duration: number;
  maxPlayers: number;
  skillLevelRequired?: string;
  description?: string;
}

interface JoinGameRequest {
  gameId: string;
}

// Get all games
router.get('/', async (req: Request, res: Response) => {
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
      where.skillLevelRequired = skillLevel as string;
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
        scheduledTime: 'asc'
      }
    });

    // Update currentPlayers count
    const gamesWithCount = games.map(game => ({
      ...game,
      currentPlayers: game._count.participants
    }));

    res.json(gamesWithCount);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get game by ID
router.get('/:id', async (req: Request, res: Response) => {
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
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { locationId, scheduledTime, duration, maxPlayers, skillLevelRequired, description } = req.body as CreateGameRequest;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!locationId || !scheduledTime || !duration || !maxPlayers) {
      return res.status(400).json({ error: 'locationId, scheduledTime, duration, and maxPlayers are required' });
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
        creatorId: req.user.id,
        scheduledTime: scheduledDate,
        duration,
        maxPlayers,
        skillLevelRequired,
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
router.post('/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.body as JoinGameRequest;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!gameId) {
      return res.status(400).json({ error: 'gameId is required' });
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

    // Check if user is already a participant
    const existingParticipant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId: req.user.id
        }
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'You are already participating in this game' });
    }

    // Add user as participant
    await prisma.gameParticipant.create({
      data: {
        gameId,
        userId: req.user.id,
        status: 'confirmed'
      }
    });

    // Update current players count
    const participantCount = await prisma.gameParticipant.count({
      where: { gameId }
    });

    await prisma.game.update({
      where: { id: gameId },
      data: { currentPlayers: participantCount }
    });

    res.json({ message: 'Successfully joined the game' });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave a game (requires authentication)
router.post('/leave', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.body as JoinGameRequest;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!gameId) {
      return res.status(400).json({ error: 'gameId is required' });
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
          userId: req.user.id
        }
      }
    });

    if (!participant) {
      return res.status(400).json({ error: 'You are not participating in this game' });
    }

    // Remove participant
    await prisma.gameParticipant.delete({
      where: {
        gameId_userId: {
          gameId,
          userId: req.user.id
        }
      }
    });

    // Update current players count
    const participantCount = await prisma.gameParticipant.count({
      where: { gameId }
    });

    await prisma.game.update({
      where: { id: gameId },
      data: { currentPlayers: participantCount }
    });

    res.json({ message: 'Successfully left the game' });
  } catch (error) {
    console.error('Error leaving game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update game (requires authentication and ownership)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledTime, duration, maxPlayers, skillLevelRequired, description, status } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const existingGame = await prisma.game.findUnique({
      where: { id }
    });

    if (!existingGame) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (existingGame.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own games' });
    }

    const updateData: any = {};
    
    if (scheduledTime) {
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'Scheduled time must be in the future' });
      }
      updateData.scheduledTime = scheduledDate;
    }
    
    if (duration) updateData.duration = duration;
    if (maxPlayers) updateData.maxPlayers = maxPlayers;
    if (skillLevelRequired) updateData.skillLevelRequired = skillLevelRequired;
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
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    if (existingGame.creatorId !== req.user.id) {
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