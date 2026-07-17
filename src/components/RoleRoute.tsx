import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppSelector } from '../redux/hooks'
import type { UserRole } from '../types'

const dashboardByRole: Record<UserRole, string> = {
  admin: '/admin',
  employee: '/employee',
  client: '/client',
}

export function RoleRoute({ role }: { role: UserRole }) {
  const { isAuthenticated, user, initializing } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user.role !== role) {
    return <Navigate to={dashboardByRole[user.role]} replace />
  }

  // Client verification gating
  if (
    user.role === 'client' &&
    user.verificationStatus &&
    user.verificationStatus !== 'verified'
  ) {
    return <Navigate to="/pending-verification" replace />
  }

  return <Outlet />
}
