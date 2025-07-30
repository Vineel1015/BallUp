import request from 'supertest';
import express from 'express';
import gamesRouter from '../../routes/games';
import { PrismaClient } from '@prisma/client';

// Mock the entire games route module dependencies
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  },
}));

jest.mock('../../middleware/rateLimiter', () => ({
  modifyRateLimit: (req: any, res: any, next: any) => next(),
  readRateLimit: (req: any, res: any, next: any) => next(),
}));

describe('Games Routes', () => {
  let app: express.Application;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/games', gamesRouter);

    // Get the mocked prisma instance
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('GET /api/games', () => {
    it('should return all games', async () => {
      const mockGames = [
        {
          id: 'game-1',
          title: 'Test Game 1',
          description: 'Test game description',
          skillLevel: 'intermediate',
          maxPlayers: 10,
          currentPlayers: 5,
          date: new Date(),
          location: { id: 'loc-1', name: 'Test Court' },
          participants: [],
        },
      ];

      (mockPrisma.game.findMany as jest.Mock).mockResolvedValue(mockGames);

      const response = await request(app).get('/api/games');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(Array.isArray(response.body.games)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      (mockPrisma.game.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/games');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/games', () => {
    const validGameData = {
      title: 'New Game',
      description: 'New game description',
      locationId: 'location-1',
      skillLevel: 'intermediate',
      maxPlayers: 10,
      date: new Date().toISOString(),
    };

    it('should create a new game', async () => {
      const mockCreatedGame = {
        id: 'new-game-id',
        ...validGameData,
        currentPlayers: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.game.create as jest.Mock).mockResolvedValue(mockCreatedGame);

      const response = await request(app)
        .post('/api/games')
        .send(validGameData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('game');
      expect(response.body.game.title).toBe(validGameData.title);
    });

    it('should validate required fields', async () => {
      const invalidGameData = {
        title: '', // Invalid: empty title
        description: 'Test description',
      };

      const response = await request(app)
        .post('/api/games')
        .send(invalidGameData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/games/nearby', () => {
    it('should return nearby games', async () => {
      const mockNearbyGames = [
        {
          id: 'nearby-game-1',
          title: 'Nearby Game',
          location: {
            id: 'loc-1',
            name: 'Nearby Court',
            latitude: 40.7128,
            longitude: -74.0060,
          },
        },
      ];

      (mockPrisma.game.findMany as jest.Mock).mockResolvedValue(mockNearbyGames);

      const response = await request(app)
        .get('/api/games/nearby')
        .query({
          lat: '40.7128',
          lng: '-74.0060',
          radius: '5',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(Array.isArray(response.body.games)).toBe(true);
    });

    it('should require lat, lng, and radius parameters', async () => {
      const response = await request(app).get('/api/games/nearby');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});