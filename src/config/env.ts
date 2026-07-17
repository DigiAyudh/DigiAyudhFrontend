/**
 * Environment and Security Configuration
 */

export const ENV = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  API_TIMEOUT: 30000,
  
  // Security
  ENABLE_HTTPS_ONLY: import.meta.env.PROD,
  ENABLE_XSS_PROTECTION: true,
  ENABLE_CSRF_PROTECTION: true,
  
  // Token Configuration
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY_CHECK_INTERVAL: 60000, // Check every 1 minute
  TOKEN_REFRESH_THRESHOLD: 24 * 60 * 60 * 1000, // 1 day before expiry
  
  // Session Configuration
  SESSION_TIMEOUT: 24 * 24 * 60 * 60 * 1000, // 24 days (safe for setTimeout)
  SESSION_WARNING_TIME: 23 * 24 * 60 * 60 * 1000, // Warn 1 day before timeout

  // CORS Configuration
  CORS_CREDENTIALS: 'include' as const,
  
  // Security Headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: true,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 15 * 60000, // 15 minutes
  
  // Logging
  LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error',
  ENABLE_ANALYTICS: !import.meta.env.DEV,
  
  // Feature Flags
  FEATURES: {
    ENABLE_2FA: true,
    ENABLE_AUDIT_LOGS: true,
    ENABLE_IP_VALIDATION: true,
    ENABLE_DEVICE_FINGERPRINTING: false,
  },
};

/**
 * Get API base URL with protocol validation
 */
export function getApiUrl(): string {
  const url = ENV.API_URL;
  
  if (import.meta.env.PROD && ENV.ENABLE_HTTPS_ONLY && !url.startsWith('https://')) {
    console.warn('Warning: API URL should be HTTPS in production');
  }
  
  return url;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Get log level
 */
export function getLogLevel(): string {
  return ENV.LOG_LEVEL;
}

export default ENV;
