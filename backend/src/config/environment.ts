import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL',
  'WEB_DEMO_URL',
  'LOG_LEVEL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'AUTH_RATE_LIMIT_WINDOW_MS',
  'AUTH_RATE_LIMIT_MAX_REQUESTS',
  'MODIFY_RATE_LIMIT_WINDOW_MS',
  'MODIFY_RATE_LIMIT_MAX_REQUESTS',
  'READ_RATE_LIMIT_WINDOW_MS',
  'READ_RATE_LIMIT_MAX_REQUESTS',
  'SENSITIVE_RATE_LIMIT_WINDOW_MS',
  'SENSITIVE_RATE_LIMIT_MAX_REQUESTS',
  'UPLOAD_RATE_LIMIT_WINDOW_MS',
  'UPLOAD_RATE_LIMIT_MAX_REQUESTS',
  'USER_GAME_RATE_LIMIT_WINDOW_MS',
  'USER_GAME_RATE_LIMIT_MAX_REQUESTS',
  'USER_PROFILE_RATE_LIMIT_WINDOW_MS',
  'USER_PROFILE_RATE_LIMIT_MAX_REQUESTS',
] as const;

// Environment validation function
function validateEnvironment() {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }

  // Validate NODE_ENV
  const validNodeEnvs = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validNodeEnvs.includes(process.env.NODE_ENV)) {
    throw new Error(`NODE_ENV must be one of: ${validNodeEnvs.join(', ')}`);
  }
}

// Type-safe environment configuration
interface EnvironmentConfig {
  // Core settings
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  
  // Database
  DATABASE_URL: string;
  
  // Supabase (optional)
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // URLs
  FRONTEND_URL: string;
  WEB_DEMO_URL: string;
  
  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'debug';
  
  // Rate limiting
  RATE_LIMIT: {
    GENERAL: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
    AUTH: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
    MODIFY: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
    READ: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
    SENSITIVE: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
    UPLOAD: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
    USER_GAME: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
    USER_PROFILE: {
      WINDOW_MS: number;
      MAX_REQUESTS: number;
    };
  };
  
  // Feature flags
  FEATURES: {
    ENABLE_SOCKET_IO: boolean;
    ENABLE_RATE_LIMITING: boolean;
    ENABLE_LOGGING: boolean;
    ENABLE_CORS: boolean;
    ENABLE_HELMET: boolean;
    ENABLE_COMPRESSION: boolean;
  };
}

// Create and export configuration
function createConfig(): EnvironmentConfig {
  // Validate environment first
  validateEnvironment();

  return {
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    
    DATABASE_URL: process.env.DATABASE_URL!,
    
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
    WEB_DEMO_URL: process.env.WEB_DEMO_URL || 'http://localhost:8080',
    
    LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentConfig['LOG_LEVEL']) || 'info',
    
    RATE_LIMIT: {
      GENERAL: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      },
      AUTH: {
        WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10),
      },
      MODIFY: {
        WINDOW_MS: parseInt(process.env.MODIFY_RATE_LIMIT_WINDOW_MS || '300000', 10), // 5 minutes
        MAX_REQUESTS: parseInt(process.env.MODIFY_RATE_LIMIT_MAX_REQUESTS || '30', 10),
      },
      READ: {
        WINDOW_MS: parseInt(process.env.READ_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
        MAX_REQUESTS: parseInt(process.env.READ_RATE_LIMIT_MAX_REQUESTS || '100', 10),
      },
      SENSITIVE: {
        WINDOW_MS: parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
        MAX_REQUESTS: parseInt(process.env.SENSITIVE_RATE_LIMIT_MAX_REQUESTS || '3', 10),
      },
      UPLOAD: {
        WINDOW_MS: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
        MAX_REQUESTS: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS || '10', 10),
      },
      USER_GAME: {
        WINDOW_MS: parseInt(process.env.USER_GAME_RATE_LIMIT_WINDOW_MS || '300000', 10), // 5 minutes
        MAX_REQUESTS: parseInt(process.env.USER_GAME_RATE_LIMIT_MAX_REQUESTS || '20', 10),
      },
      USER_PROFILE: {
        WINDOW_MS: parseInt(process.env.USER_PROFILE_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
        MAX_REQUESTS: parseInt(process.env.USER_PROFILE_RATE_LIMIT_MAX_REQUESTS || '5', 10),
      },
    },
    
    FEATURES: {
      ENABLE_SOCKET_IO: process.env.ENABLE_SOCKET_IO !== 'false',
      ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',
      ENABLE_LOGGING: process.env.ENABLE_LOGGING !== 'false',
      ENABLE_CORS: process.env.ENABLE_CORS !== 'false',
      ENABLE_HELMET: process.env.ENABLE_HELMET !== 'false',
      ENABLE_COMPRESSION: process.env.ENABLE_COMPRESSION !== 'false',
    },
  };
}

// Export the configuration
export const config = createConfig();

// Export validation function for testing
export { validateEnvironment };

// Helper functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';

// Export types
export type { EnvironmentConfig };

// Log configuration on startup (but not sensitive values)
if (config.FEATURES.ENABLE_LOGGING) {
  console.log('🔧 Environment Configuration Loaded:', {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    LOG_LEVEL: config.LOG_LEVEL,
    FEATURES: config.FEATURES,
    RATE_LIMITS: {
      GENERAL: config.RATE_LIMIT.GENERAL,
      AUTH: config.RATE_LIMIT.AUTH,
    },
  });
}