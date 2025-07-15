import { Platform } from 'react-native';

/**
 * Environment Configuration for RoadSide+ App
 * Handles environment variables and platform-specific configurations
 */

export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
  };
  features: {
    tempoDevtools: boolean;
    debugMode: boolean;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key',
  },
  app: {
    name: 'RoadSide+',
    version: '1.0.0',
    environment: 'production',
  },
  features: {
    tempoDevtools: false,
    debugMode: false,
  },
};

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
}

/**
 * Determine if we're in development mode
 */
function isDevelopment(): boolean {
  return __DEV__ || getEnvVar('NODE_ENV') === 'development';
}

/**
 * Get the current app configuration
 */
export function getAppConfig(): AppConfig {
  const config: AppConfig = {
    supabase: {
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', defaultConfig.supabase.url),
      anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', defaultConfig.supabase.anonKey),
    },
    app: {
      name: defaultConfig.app.name,
      version: defaultConfig.app.version,
      environment: isDevelopment() ? 'development' : 'production',
    },
    features: {
      tempoDevtools: isDevelopment() && !!getEnvVar('EXPO_PUBLIC_TEMPO'),
      debugMode: isDevelopment(),
    },
  };

  return config;
}

/**
 * Platform-specific configurations
 */
export const platformConfig = {
  isWeb: Platform.OS === 'web',
  isNative: Platform.OS !== 'web',
  isMobile: Platform.OS === 'ios' || Platform.OS === 'android',
  
  // Web-specific settings
  web: {
    enableServiceWorker: true,
    enableOfflineMode: false,
  },
  
  // Native-specific settings
  native: {
    enablePushNotifications: true,
    enableLocationServices: true,
  },
};

/**
 * API endpoints configuration
 */
export const apiConfig = {
  baseUrl: getAppConfig().supabase.url,
  timeout: 10000,
  retryAttempts: 3,
  
  endpoints: {
    auth: '/auth/v1',
    api: '/rest/v1',
    storage: '/storage/v1',
  },
};

/**
 * Feature flags for conditional functionality
 */
export const featureFlags = {
  enableMaps: true,
  enableRealTimeUpdates: true,
  enableOfflineMode: false,
  enableAnalytics: !isDevelopment(),
  enableErrorReporting: !isDevelopment(),
};

export default getAppConfig();
