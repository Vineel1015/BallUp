import request from 'supertest';
import express from 'express';
import {
  generalRateLimit,
  authRateLimit,
  modifyRateLimit,
} from '../../middleware/rateLimiter';

describe('Rate Limiting Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe('generalRateLimit', () => {
    it('should allow requests within limit', async () => {
      app.use(generalRateLimit);
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should include rate limit headers', async () => {
      app.use(generalRateLimit);
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app).get('/test');
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('authRateLimit', () => {
    it('should apply stricter limits for auth endpoints', async () => {
      app.use(authRateLimit);
      app.post('/auth/login', (req, res) => res.json({ success: true }));

      const response = await request(app).post('/auth/login');
      expect(response.status).toBe(200);
      
      // Auth rate limit should have lower limits than general
      const limit = parseInt(response.headers['x-ratelimit-limit'] as string || '0');
      expect(limit).toBeLessThanOrEqual(5); // As per config
    });
  });

  describe('modifyRateLimit', () => {
    it('should apply appropriate limits for modify operations', async () => {
      app.use(modifyRateLimit);
      app.post('/games', (req, res) => res.json({ success: true }));

      const response = await request(app).post('/games');
      expect(response.status).toBe(200);
      
      const limit = parseInt(response.headers['x-ratelimit-limit'] as string || '0');
      expect(limit).toBeLessThanOrEqual(30); // As per config
    });
  });
});