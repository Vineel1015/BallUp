import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { userProfileLimiter } from '../middleware/rateLimiter';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface UpdateProfileRequest {
  skillLevel?: string;
  preferredPosition?: string;
  bio?: string;
}

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        profilePicture: true,
        skillLevel: true,
        preferredPosition: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdGames: true,
            gameParticipants: true,
            createdLocations: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/me', userProfileLimiter, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { skillLevel, preferredPosition, bio } = req.body as UpdateProfileRequest;

    const updateData: any = {};
    
    if (skillLevel !== undefined) {
      if (!['beginner', 'intermediate', 'advanced'].includes(skillLevel)) {
        return res.status(400).json({ error: 'Invalid skill level' });
      }
      updateData.skillLevel = skillLevel;
    }
    
    if (preferredPosition !== undefined) {
      updateData.preferredPosition = preferredPosition;
    }
    
    if (bio !== undefined) {
      updateData.bio = bio;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        profilePicture: true,
        skillLevel: true,
        preferredPosition: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's games (created and participating)
router.get('/me/games', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all games user is involved with in a single optimized query
    const allUserGames = await prisma.game.findMany({
      where: {
        OR: [
          { creatorId: req.user.id },
          { participants: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                skillLevel: true,
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    // Separate games by type
    const createdGames = allUserGames.filter(game => game.creatorId === req.user!.id);
    const participatingGames = allUserGames.filter(
      game => game.creatorId !== req.user!.id && 
      game.participants.some(participant => participant.userId === req.user!.id)
    );

    res.json({
      createdGames: createdGames.map(game => ({ ...game, currentPlayers: game.participants.length })),
      participatingGames: participatingGames.map(game => ({ ...game, currentPlayers: game.participants.length }))
    });
  } catch (error) {
    console.error('Error fetching user games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's current active game
router.get('/me/active-game', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find user's active game (scheduled or active status, and user is still a participant)
    const activeGame = await prisma.game.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: req.user!.id,
                status: 'joined' // Only joined participants, not left/kicked
              }
            }
          },
          {
            status: {
              in: ['scheduled', 'starting', 'active'] // Active game statuses
            }
          },
          {
            scheduledAt: {
              gte: new Date(Date.now() - 3 * 60 * 60 * 1000) // Not more than 3 hours past scheduled time
            }
          }
        ]
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
          }
        },
        participants: {
          where: {
            status: 'joined'
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                skillLevel: true,
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    if (!activeGame) {
      return res.json({ activeGame: null });
    }

    res.json({
      activeGame: {
        ...activeGame,
        currentPlayers: activeGame.participants.length
      }
    });
  } catch (error) {
    console.error('Error fetching active game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;