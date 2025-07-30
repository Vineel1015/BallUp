import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';

const router = Router();

// Middleware to check for admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Helper function to log admin actions
async function logAdminAction(adminId: string, action: string, targetType: string, targetId: string, details?: any) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details
    }
  });
}

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalLocations,
      totalGames,
      pendingLocations,
      activeUsers,
      todayGames
    ] = await Promise.all([
      prisma.user.count(),
      prisma.location.count(),
      prisma.game.count(),
      prisma.location.count({ where: { isApproved: false, isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.game.count({
        where: {
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    const recentActivity = await prisma.adminLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { username: true, email: true }
        }
      }
    });

    res.json({
      stats: {
        totalUsers,
        totalLocations,
        totalGames,
        pendingLocations,
        activeUsers,
        todayGames
      },
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// User management
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('role').optional().isIn(['user', 'admin', 'super_admin']),
  query('status').optional().isIn(['active', 'inactive'])
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) where.role = role;
    if (status) where.isActive = status === 'active';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
          gamesPlayed: true,
          gamesCreated: true,
          rating: true,
          createdAt: true,
          lastLoginAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user
router.patch('/users/:id', [
  param('id').isString(),
  body('role').optional().isIn(['user', 'admin', 'super_admin']),
  body('isActive').optional().isBoolean(),
  body('isVerified').optional().isBoolean()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { role, isActive, isVerified } = req.body;
    const adminId = (req as any).user.id;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isVerified === 'boolean' && { isVerified })
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true
      }
    });

    // Log admin action
    await logAdminAction(adminId, 'user_updated', 'User', id, {
      changes: { role, isActive, isVerified },
      previousValues: {
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Location management
router.get('/locations', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'all']),
  query('search').optional().isString()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string || 'all';
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status !== 'all') {
      switch (status) {
        case 'pending':
          where.isApproved = false;
          where.isActive = true;
          break;
        case 'approved':
          where.isApproved = true;
          break;
        case 'rejected':
          where.isActive = false;
          break;
      }
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              username: true,
              email: true
            }
          },
          _count: {
            select: {
              games: true
            }
          }
        }
      }),
      prisma.location.count({ where })
    ]);

    res.json({
      locations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Approve/reject location
router.patch('/locations/:id/approval', [
  param('id').isString(),
  body('approved').isBoolean(),
  body('reason').optional().isString()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { approved, reason } = req.body;
    const adminId = (req as any).user.id;

    const location = await prisma.location.findUnique({ where: { id } });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        isApproved: approved,
        isActive: approved, // If rejected, also deactivate
        approvedBy: approved ? adminId : null,
        approvedAt: approved ? new Date() : null
      },
      include: {
        creator: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    // Log admin action
    await logAdminAction(adminId, approved ? 'location_approved' : 'location_rejected', 'Location', id, {
      reason,
      locationName: location.name,
      creatorId: location.createdBy
    });

    res.json(updatedLocation);
  } catch (error) {
    console.error('Update location approval error:', error);
    res.status(500).json({ error: 'Failed to update location approval' });
  }
});

// Delete location
router.delete('/locations/:id', [
  param('id').isString(),
  body('reason').optional().isString()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user.id;

    const location = await prisma.location.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { games: true }
        }
      }
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Check if location has active games
    const activeGames = await prisma.game.count({
      where: {
        locationId: id,
        status: { in: ['scheduled', 'starting', 'active'] }
      }
    });

    if (activeGames > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete location with active games',
        activeGames 
      });
    }

    // Soft delete by deactivating
    await prisma.location.update({
      where: { id },
      data: { isActive: false }
    });

    // Log admin action
    await logAdminAction(adminId, 'location_deleted', 'Location', id, {
      reason,
      locationName: location.name,
      totalGames: location._count.games
    });

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// Game management
router.get('/games', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['scheduled', 'active', 'completed', 'cancelled', 'all'])
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string || 'all';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          creator: {
            select: {
              username: true,
              email: true
            }
          },
          location: {
            select: {
              name: true,
              address: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        }
      }),
      prisma.game.count({ where })
    ]);

    res.json({
      games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch games error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Admin logs
router.get('/logs', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('action').optional().isString(),
  query('adminId').optional().isString()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string;
    const adminId = req.query.adminId as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (adminId) where.adminId = adminId;

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.adminLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch admin logs error:', error);
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

export default router;