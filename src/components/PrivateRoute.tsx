import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../redux/hooks'
import PageLoader from './common/FullPageLoader'
import type { UserRole } from '../types'

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

  if (initializing) {
    return <PageLoader />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Clients that are not yet verified are held on the pending screen.
  if (user.role === 'client' && user.verificationStatus && user.verificationStatus !== 'verified') {
    return <Navigate to="/pending-verification" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={roleDashboardMap[user.role]} replace />
  }

  return <>{children}</>
}
