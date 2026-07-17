/**
 * Security Utilities for Authorization & Data Protection
 */

import type { User, UserRole } from '@/types';

/**
 * Role-based permission mapping
 */
export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    'manage:users',
    'manage:employees',
    'manage:projects',
    'manage:tasks',
    'manage:invoices',
    'manage:payments',
    'manage:reports',
    'manage:clients',
    'verify:clients',
    'view:audit-logs',
    'manage:settings',
    'view:analytics',
    'manage:teams',
  ],
  employee: [
    'view:projects',
    'manage:tasks',
    'view:assigned-tasks',
    'upload:files',
    'view:clients',
    'view:attendance',
    'view:messages',
    'view:notifications',
    'view:profile',
    'manage:profile',
    'view:documents',
    'update:time-logs',
  ],
  client: [
    'view:projects',
    'view:invoices',
    'view:documents',
    'view:meetings',
    'view:messages',
    'view:support-tickets',
    'create:support-tickets',
    'comment:projects',
    'view:profile',
    'manage:profile',
    'view:notifications',
    'approve:deliverables',
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  const userPermissions = rolePermissions[user.role] || [];
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if a user has all specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  const userPermissions = rolePermissions[user.role] || [];
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate and encode user data
 */
export function encodeUserData(data: Record<string, any>): Record<string, any> {
  const encoded: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      encoded[key] = sanitizeInput(value);
    } else if (value === null || value === undefined) {
      encoded[key] = value;
    } else if (typeof value === 'object') {
      encoded[key] = encodeUserData(value);
    } else {
      encoded[key] = value;
    }
  }
  
  return encoded;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      token += characters[array[i] % characters.length];
    }
  } else {
    // Fallback for non-browser environments
    for (let i = 0; i < length; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
  }
  
  return token;
}

/**
 * Hash a string using a simple hash function (for non-critical hashing)
 * NOTE: This is NOT cryptographically secure - use backend hashing for passwords
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
  if (!/\d/.test(password)) errors.push('Must contain number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Must contain special character');
  
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (errors.length === 0) strength = 'strong';
  else if (errors.length === 1) strength = 'good';
  else if (errors.length === 2) strength = 'fair';
  
  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
}

/**
 * Check if user can access a resource based on ownership
 */
export function canAccessResource(
  user: User | null,
  resourceOwnerId: string | undefined,
  requiredPermission?: string
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (user.role === 'admin') return true;
  
  // Check specific permission if provided
  if (requiredPermission && !hasPermission(user, requiredPermission)) return false;
  
  // Check ownership
  if (resourceOwnerId && user._id === resourceOwnerId) return true;
  
  return false;
}

/**
 * Validate JWT token format (basic check, signature validation on backend)
 */
export function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Decode payload to check if it's valid JSON
    const payload = JSON.parse(atob(parts[1]));
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;

    const claimKeys = Object.keys(payload).filter((key) => !['iat', 'exp', 'nbf', 'iss', 'aud', 'jti'].includes(key));
    return claimKeys.length > 0 || typeof payload.exp === 'number' || typeof payload.iat === 'number' || typeof payload.nbf === 'number';
  } catch {
    return false;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return null;
    
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Check if token is about to expire (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
  
  return expiry <= fiveMinutesFromNow;
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  action: string,
  entity: string,
  userId: string,
  details?: Record<string, any>
) {
  return {
    action,
    entity,
    userId,
    timestamp: new Date(),
    details: details || {},
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };
}
