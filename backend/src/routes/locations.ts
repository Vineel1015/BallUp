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

interface CreateLocationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  amenities: string[];
}

// Get all locations
router.get('/', async (req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        _count: {
          select: {
            games: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        games: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
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
        }
      }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new location (requires authentication)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, latitude, longitude, description, amenities } = req.body as CreateLocationRequest;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Name, address, latitude, and longitude are required' });
    }

    const location = await prisma.location.create({
      data: {
        name,
        address,
        latitude,
        longitude,
        description,
        amenities: amenities || [],
        createdBy: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    res.status(201).json({
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update location (requires authentication and ownership)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, description, amenities } = req.body as CreateLocationRequest;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    if (existingLocation.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own locations' });
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        address,
        latitude,
        longitude,
        description,
        amenities: amenities || [],
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    res.json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete location (requires authentication and ownership)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    if (existingLocation.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own locations' });
    }

    await prisma.location.delete({
      where: { id }
    });

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;