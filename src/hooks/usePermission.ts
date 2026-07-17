/**
 * Hook for checking user permissions
 */

import { useAppSelector } from '@/redux/hooks';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource,
} from '@/utils/security';

export function usePermission() {
  const user = useAppSelector((state) => state.auth.user);

  return {
    user,
    /**
     * Check if user has a specific permission
     */
    can: (permission: string) => hasPermission(user, permission),

    /**
     * Check if user has any of the specified permissions
     */
    canAny: (permissions: string[]) => hasAnyPermission(user, permissions),

    /**
     * Check if user has all specified permissions
     */
    canAll: (permissions: string[]) => hasAllPermissions(user, permissions),

    /**
     * Check if user can access a resource
     */
    canAccess: (resourceOwnerId: string | undefined, requiredPermission?: string) =>
      canAccessResource(user, resourceOwnerId, requiredPermission),

    /**
     * Check if user is admin
     */
    isAdmin: () => user?.role === 'admin',

    /**
     * Check if user is employee
     */
    isEmployee: () => user?.role === 'employee',

    /**
     * Check if user is client
     */
    isClient: () => user?.role === 'client',

    /**
     * Check if user is verified (for clients)
     */
    isVerified: () => user?.verificationStatus === 'verified',

    /**
     * Check if user role matches
     */
    hasRole: (role: string) => user?.role === role,
  };
}
