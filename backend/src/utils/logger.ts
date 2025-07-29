import winston from 'winston';
import path from 'path';

const logDir = 'logs';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transports
transports.push(
  // All logs
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
  }),
  // Error logs
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
  }),
  // HTTP logs
  new winston.transports.File({
    filename: path.join(logDir, 'access.log'),
    level: 'http',
    format: fileFormat,
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: fileFormat,
  transports,
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
});

// Create a stream object for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Helper functions for different log levels
export const logError = (message: string, error?: any) => {
  if (error) {
    logger.error(`${message}: ${error.message}`, { 
      stack: error.stack,
      ...error 
    });
  } else {
    logger.error(message);
  }
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

// Log application start
export const logAppStart = (port: number) => {
  logger.info(`🚀 BallUp API server started on port ${port}`, {
    port,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
};

// Log database connection
export const logDatabaseConnection = (status: 'connected' | 'error', error?: any) => {
  if (status === 'connected') {
    logger.info('📊 Database connected successfully');
  } else {
    logError('❌ Database connection failed', error);
  }
};

// Log API requests with timing
export const logApiRequest = (method: string, url: string, statusCode: number, responseTime: number, userId?: string) => {
  logger.http(`${method} ${url} ${statusCode} - ${responseTime}ms`, {
    method,
    url,
    statusCode,
    responseTime,
    userId,
  });
};

// Log authentication events
export const logAuth = (event: 'login' | 'logout' | 'register' | 'token_refresh', userId: string, ip?: string) => {
  logger.info(`🔐 Auth event: ${event}`, {
    event,
    userId,
    ip,
    timestamp: new Date().toISOString(),
  });
};

// Log security events
export const logSecurity = (event: string, details: any) => {
  logger.warn(`🛡️ Security event: ${event}`, {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export default logger;