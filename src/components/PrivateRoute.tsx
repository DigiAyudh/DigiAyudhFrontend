import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../redux/hooks'
import PageLoader from './common/FullPageLoader'
import type { UserRole } from '../types'
import { tokenManager } from '../utils/tokenManager'

interface PrivateRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

const roleDashboardMap: Record<UserRole, string> = {
  admin: '/admin',
  employee: '/employee',
  client: '/client',
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, user, initializing } = useAppSelector((state) => state.auth)
  const location = useLocation()

  const hasStoredSession = !!tokenManager.getToken() && tokenManager.isSessionValid()
  const effectiveUser = user ?? (tokenManager.getUser() as typeof user)
  const effectiveRole = effectiveUser?.role ?? (tokenManager.getUserRoleFromToken() as UserRole | null)

  if (initializing) {
    return <PageLoader />
  }

  if (!isAuthenticated && !hasStoredSession) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Clients that are not yet verified are held on the pending screen.
  if (effectiveUser?.role === 'client' && effectiveUser.verificationStatus && effectiveUser.verificationStatus !== 'verified') {
    return <Navigate to="/pending-verification" replace />
  }

  if (requiredRole && effectiveRole && effectiveRole !== requiredRole) {
    return <Navigate to={roleDashboardMap[effectiveRole] ?? '/login'} replace />
  }

  return <>{children}</>
}
