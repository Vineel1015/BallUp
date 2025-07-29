import { Request, Response, NextFunction } from 'express';
import { logError, logSecurity } from '../utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  path?: string;
  value?: any;
  errors?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with proper logging system
  logError(`API Error: ${err.message}`, {
    ...error,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Prisma validation error
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 } as CustomError;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 } as CustomError;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 } as CustomError;
    logSecurity('Invalid JWT token attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 } as CustomError;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = { message, statusCode: 400 } as CustomError;
  }

  // Rate limiting errors
  if (err.message?.includes('Too many requests')) {
    error = { message: 'Too many requests, please try again later', statusCode: 429 } as CustomError;
  }

  // Database connection errors
  if (err.message?.includes('connection') || err.code === 'ECONNREFUSED') {
    const message = 'Database connection error';
    error = { message, statusCode: 503 } as CustomError;
  }

  // Timeout errors
  if (err.message?.includes('timeout') || err.code === 'TIMEOUT') {
    const message = 'Request timeout';
    error = { message, statusCode: 408 } as CustomError;
  }

  // File size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 413 } as CustomError;
  }

  // CORS errors
  if (err.message?.includes('CORS')) {
    const message = 'CORS policy violation';
    error = { message, statusCode: 403 } as CustomError;
    logSecurity('CORS policy violation', {
      ip: req.ip,
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: error
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `Route ${req.originalUrl} not found`;
  
  logSecurity('404 - Route not found', {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: {
      message,
      availableRoutes: [
        'GET /',
        'GET /health',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'GET /api/games',
        'POST /api/games',
        'GET /api/locations',
        'POST /api/locations',
        'GET /api/users/profile',
        'PUT /api/users/profile'
      ]
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

// Async error wrapper
export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Custom error creator
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}