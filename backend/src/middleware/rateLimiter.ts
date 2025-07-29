import rateLimit from 'express-rate-limit';
import { logSecurity } from '../utils/logger';
import { config } from '../config/environment';

// Helper function to create rate limiter with logging
const createLimiter = (options: any) => {
  return rateLimit({
    ...options,
    handler: (req, res) => {
      logSecurity('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
      });
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(options.windowMs / 1000), // seconds
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
export const generalLimiter = createLimiter({
  windowMs: config.RATE_LIMIT.GENERAL.WINDOW_MS,
  max: config.RATE_LIMIT.GENERAL.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});

// Strict rate limiter for authentication endpoints
export const authLimiter = createLimiter({
  windowMs: config.RATE_LIMIT.AUTH.WINDOW_MS,
  max: config.RATE_LIMIT.AUTH.MAX_REQUESTS,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Medium rate limiter for data modification endpoints
export const modifyLimiter = createLimiter({
  windowMs: config.RATE_LIMIT.MODIFY.WINDOW_MS,
  max: config.RATE_LIMIT.MODIFY.MAX_REQUESTS,
  message: 'Too many modification requests, please slow down.',
});

// Lenient rate limiter for read-only endpoints
export const readLimiter = createLimiter({
  windowMs: config.RATE_LIMIT.READ.WINDOW_MS,
  max: config.RATE_LIMIT.READ.MAX_REQUESTS,
  message: 'Too many read requests, please slow down.',
});

// Very strict rate limiter for sensitive operations
export const sensitiveLimiter = createLimiter({
  windowMs: config.RATE_LIMIT.SENSITIVE.WINDOW_MS,
  max: config.RATE_LIMIT.SENSITIVE.MAX_REQUESTS,
  message: 'Too many sensitive operation attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Rate limiter for file uploads
export const uploadLimiter = createLimiter({
  windowMs: config.RATE_LIMIT.UPLOAD.WINDOW_MS,
  max: config.RATE_LIMIT.UPLOAD.MAX_REQUESTS,
  message: 'Too many upload requests, please try again later.',
});

// Create a rate limiter based on user ID for authenticated routes
export const createUserRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return (req as any).user?.id || req.ip;
    },
    handler: (req, res) => {
      const userId = (req as any).user?.id;
      logSecurity('User rate limit exceeded', {
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
      });
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.round(windowMs / 1000),
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// User-specific rate limiter for game operations
export const userGameLimiter = createUserRateLimiter(
  config.RATE_LIMIT.USER_GAME.WINDOW_MS,
  config.RATE_LIMIT.USER_GAME.MAX_REQUESTS
);

// User-specific rate limiter for profile updates
export const userProfileLimiter = createUserRateLimiter(
  config.RATE_LIMIT.USER_PROFILE.WINDOW_MS,
  config.RATE_LIMIT.USER_PROFILE.MAX_REQUESTS
);