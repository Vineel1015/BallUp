import {
  logError,
  logWarn,
  logInfo,
  logDebug,
  logAuth,
  logSecurity,
  logApiRequest,
} from '../../utils/logger';

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
  addColors: jest.fn(),
}));

describe('Logger Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logError', () => {
    it('should log error message only', () => {
      const message = 'Test error message';
      logError(message);
      // Test passes if no errors are thrown
    });

    it('should log error with error object', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      logError(message, error);
      // Test passes if no errors are thrown
    });
  });

  describe('logAuth', () => {
    it('should log authentication events', () => {
      logAuth('login', 'user123', '192.168.1.1');
      // Test passes if no errors are thrown
    });

    it('should log authentication events without IP', () => {
      logAuth('logout', 'user123');
      // Test passes if no errors are thrown
    });
  });

  describe('logSecurity', () => {
    it('should log security events', () => {
      logSecurity('rate_limit_exceeded', {
        userId: 'user123',
        ip: '192.168.1.1',
      });
      // Test passes if no errors are thrown
    });
  });

  describe('logApiRequest', () => {
    it('should log API requests', () => {
      logApiRequest('GET', '/api/games', 200, 150);
      // Test passes if no errors are thrown
    });

    it('should log API requests with user ID', () => {
      logApiRequest('POST', '/api/games', 201, 250, 'user123');
      // Test passes if no errors are thrown
    });
  });
});