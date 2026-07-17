/**
 * Session Management Hook
 * Handles session timeout, inactivity, and token refresh
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { tokenManager } from '@/utils/tokenManager';
import ENV from '@/config/env';
import toast from 'react-hot-toast';

export function useSession() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownWarningRef = useRef(false);

  /**
   * Reset inactivity timers
   */
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    hasShownWarningRef.current = false;

    if (!isAuthenticated) return;

    // Show warning timer
    warningTimerRef.current = setTimeout(() => {
      if (!hasShownWarningRef.current) {
        hasShownWarningRef.current = true;
        toast.warning('Your session is about to expire due to inactivity. Please click to continue.');
      }
    }, ENV.SESSION_WARNING_TIME) as unknown as NodeJS.Timeout;

    // Logout timer
    inactivityTimerRef.current = setTimeout(() => {
      dispatch(logout());
      toast.error('Session expired due to inactivity. Please login again.');
    }, ENV.SESSION_TIMEOUT) as unknown as NodeJS.Timeout;
  }, [isAuthenticated, dispatch]);

  /**
   * Setup activity listeners
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    resetInactivityTimer();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [isAuthenticated, resetInactivityTimer]);

  /**
   * Handle token expiring soon
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleTokenExpiringSoon = () => {
      if (tokenManager.isTokenExpiringSoon()) {
        toast.warning('Your session token is about to expire. Refreshing...');
      }
    };

    window.addEventListener('token:expiring-soon', handleTokenExpiringSoon);

    return () => {
      window.removeEventListener('token:expiring-soon', handleTokenExpiringSoon);
    };
  }, [isAuthenticated]);

  /**
   * Manual session activity notification
   */
  const notifyActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  return {
    notifyActivity,
  };
}
