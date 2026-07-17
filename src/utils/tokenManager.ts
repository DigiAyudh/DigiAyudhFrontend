/**
 * Token Management and JWT Handling
 */

import { isValidToken, getTokenExpiry, isTokenExpiringSoon } from './security';
import ENV from '@/config/env';

class TokenManager {
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * Store token securely
   */
  setToken(token: string): void {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token format');
      return;
    }

    if (!isValidToken(token)) {
      console.error('Invalid token structure');
      return;
    }

    try {
      localStorage.setItem(ENV.TOKEN_KEY, token);
      localStorage.setItem('token', token);
      this.setupTokenRefreshTimer(token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Store refresh token securely
   */
  setRefreshToken(refreshToken: string): void {
    if (!refreshToken || typeof refreshToken !== 'string') {
      console.error('Invalid refresh token format');
      return;
    }

    try {
      localStorage.setItem(ENV.REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Get token from storage
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(ENV.TOKEN_KEY) || localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(ENV.REFRESH_TOKEN_KEY) || localStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Check if token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if token is valid
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return isValidToken(token);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const expiry = getTokenExpiry(token);
    if (!expiry) return true;

    return new Date() >= expiry;
  }

  /**
   * Check if token is expiring soon
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return true;
    return isTokenExpiringSoon(token);
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(): number {
    const token = this.getToken();
    if (!token) return 0;

    const expiry = getTokenExpiry(token);
    if (!expiry) return 0;

    const now = new Date();
    return Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    try {
      localStorage.removeItem(ENV.TOKEN_KEY);
      localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      this.clearTokenRefreshTimer();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Setup automatic token refresh timer
   */
  private setupTokenRefreshTimer(token: string): void {
    this.clearTokenRefreshTimer();

    const timeUntilExpiry = this.getTimeUntilExpiry();
    const refreshTime = Math.max(
      5000,
      (timeUntilExpiry - 300) * 1000 // Refresh 5 minutes before expiry
    );

    this.tokenRefreshTimer = setTimeout(() => {
      // Dispatch refresh action if token is expiring
      if (this.isTokenExpiringSoon()) {
        window.dispatchEvent(new CustomEvent('token:expiring-soon'));
      }
    }, refreshTime) as unknown as NodeJS.Timeout;
  }

  /**
   * Clear token refresh timer
   */
  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Decode token payload (without verification - verification happens on backend)
   */
  decodeToken(token?: string): Record<string, any> | null {
    const tokenToDecode = token || this.getToken();
    if (!tokenToDecode) return null;

    try {
      const parts = tokenToDecode.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Get user ID from token
   */
  getUserIdFromToken(): string | null {
    const payload = this.decodeToken();
    return payload?.sub || payload?.id || payload?.userId || null;
  }

  /**
   * Get user role from token
   */
  getUserRoleFromToken(): string | null {
    const payload = this.decodeToken();
    return payload?.role || null;
  }
}

export const tokenManager = new TokenManager();
export default tokenManager;
