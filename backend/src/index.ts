import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/environment';
import logger, { morganStream, logAppStart, logError } from './utils/logger';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import locationRoutes from './routes/locations';
import gameRoutes from './routes/games';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import { setupSocketHandlers } from './services/socketService';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const server = createServer(app);

// CORS configuration using environment config
const corsOptions = {
  origin: [
    config.FRONTEND_URL,
    config.WEB_DEMO_URL,
    'https://ballup-web.vercel.app', // Production web app
    'https://ballup-api.railway.app', // Production API
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Rate limiting is now handled by the rateLimiter middleware

// Socket.IO setup with CORS (only if enabled)
const io = config.FEATURES.ENABLE_SOCKET_IO ? new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
}) : null;

// Middleware (conditionally applied based on configuration)
if (config.FEATURES.ENABLE_HELMET) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  }));
}

if (config.FEATURES.ENABLE_CORS) {
  app.use(cors(corsOptions));
}

if (config.FEATURES.ENABLE_COMPRESSION) {
  app.use(compression());
}

if (config.FEATURES.ENABLE_LOGGING) {
  app.use(morgan(
    config.NODE_ENV === 'production' ? 'combined' : 'dev',
    { stream: morganStream }
  ));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes (if enabled)
if (config.FEATURES.ENABLE_RATE_LIMITING) {
  app.use('/api/', generalLimiter);
}

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'BallUp API Server is running!',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV,
    features: config.FEATURES
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO handlers (only if Socket.IO is enabled)
if (io && config.FEATURES.ENABLE_SOCKET_IO) {
  setupSocketHandlers(io);
}

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.listen(config.PORT, () => {
  logAppStart(config.PORT);
  logger.info(`📊 Environment: ${config.NODE_ENV}`);
  if (config.FEATURES.ENABLE_SOCKET_IO) {
    logger.info(`🔗 Socket.IO enabled for real-time features`);
  }
  if (config.NODE_ENV === 'development') {
    logger.info(`🌐 Access the API at: http://localhost:${config.PORT}`);
    logger.info(`📋 Health check: http://localhost:${config.PORT}/health`);
  }
});