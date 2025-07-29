import { Platform } from 'react-native';

// Environment configuration interface
interface EnvironmentConfig {
  API_BASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  ENABLE_LOGGING: boolean;
  ENABLE_ERROR_REPORTING: boolean;
  DEFAULT_LOCATION: {
    latitude: number;
    longitude: number;
  };
  FEATURES: {
    ENABLE_PUSH_NOTIFICATIONS: boolean;
    ENABLE_ANALYTICS: boolean;
    ENABLE_OFFLINE_MODE: boolean;
  };
}

// Development configuration
const DEV_CONFIG: EnvironmentConfig = {
  API_BASE_URL: Platform.select({
    ios: 'http://localhost:3000/api',
    android: 'http://10.0.2.2:3000/api', // Android emulator localhost
    default: 'http://localhost:3000/api',
  }) as string,
  NODE_ENV: 'development',
  ENABLE_LOGGING: true,
  ENABLE_ERROR_REPORTING: false,
  DEFAULT_LOCATION: {
    latitude: 40.7128, // New York City
    longitude: -74.0060,
  },
  FEATURES: {
    ENABLE_PUSH_NOTIFICATIONS: false,
    ENABLE_ANALYTICS: false,
    ENABLE_OFFLINE_MODE: false,
  },
};

// Production configuration
const PROD_CONFIG: EnvironmentConfig = {
  API_BASE_URL: 'https://ballup-api.railway.app/api', // Replace with actual production URL
  NODE_ENV: 'production',
  ENABLE_LOGGING: false,
  ENABLE_ERROR_REPORTING: true,
  DEFAULT_LOCATION: {
    latitude: 40.7128, // New York City
    longitude: -74.0060,
  },
  FEATURES: {
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true,
    ENABLE_OFFLINE_MODE: true,
  },
};

// Test configuration
const TEST_CONFIG: EnvironmentConfig = {
  ...DEV_CONFIG,
  NODE_ENV: 'test',
  ENABLE_LOGGING: false,
  ENABLE_ERROR_REPORTING: false,
};

// Determine current environment
function getCurrentEnvironment(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV;
  
  switch (nodeEnv) {
    case 'production':
      return PROD_CONFIG;
    case 'test':
      return TEST_CONFIG;
    default:
      return DEV_CONFIG;
  }
}

// Export the configuration
export const CONFIG = getCurrentEnvironment();

// Helper functions
export const isDevelopment = () => CONFIG.NODE_ENV === 'development';
export const isProduction = () => CONFIG.NODE_ENV === 'production';
export const isTest = () => CONFIG.NODE_ENV === 'test';

// Validation function
export function validateEnvironment() {
  if (!CONFIG.API_BASE_URL) {
    throw new Error('API_BASE_URL is required');
  }
  
  if (isProduction() && CONFIG.API_BASE_URL.includes('localhost')) {
    console.warn('⚠️  Production build is using localhost API URL');
  }
}

// Log configuration in development
if (isDevelopment() && CONFIG.ENABLE_LOGGING) {
  console.log('🔧 Frontend Environment Configuration:', {
    NODE_ENV: CONFIG.NODE_ENV,
    API_BASE_URL: CONFIG.API_BASE_URL,
    ENABLE_LOGGING: CONFIG.ENABLE_LOGGING,
    FEATURES: CONFIG.FEATURES,
  });
}

// Validate on import
validateEnvironment();

export default CONFIG;