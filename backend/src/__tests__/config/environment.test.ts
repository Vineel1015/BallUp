import { validateEnvironment } from '../../config/environment';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should pass with valid environment variables', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ballup_test';
      process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
      
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw error when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;
      process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
      
      expect(() => validateEnvironment()).toThrow('Missing required environment variables: DATABASE_URL');
    });

    it('should throw error when JWT_SECRET is missing', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ballup_test';
      delete process.env.JWT_SECRET;
      
      expect(() => validateEnvironment()).toThrow('Missing required environment variables: JWT_SECRET');
    });

    it('should throw error when JWT_SECRET is too short', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ballup_test';
      process.env.JWT_SECRET = 'short';
      
      expect(() => validateEnvironment()).toThrow('JWT_SECRET must be at least 32 characters long for security');
    });

    it('should throw error for invalid NODE_ENV', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ballup_test';
      process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
      process.env.NODE_ENV = 'invalid';
      
      expect(() => validateEnvironment()).toThrow('NODE_ENV must be one of: development, production, test');
    });
  });
});