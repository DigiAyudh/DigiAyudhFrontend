import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../redux/hooks'
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAppDispatch } from '../redux/hooks'
import { logout } from '../redux/slices/authSlice'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'employee' ? '/employee/dashboard' : '/client/dashboard',
    },
    {
      label: 'Projects',
      icon: Briefcase,
      path: '/projects',
    },
    {
      label: 'Tasks',
      icon: CheckSquare,
      path: '/tasks',
    },
    ...(user?.role === 'admin'
      ? [
          { label: 'Employees', icon: Users, path: '/employees' },
          { label: 'Leads', icon: TrendingUp, path: '/leads' },
          { label: 'Reports', icon: TrendingUp, path: '/reports' },
        ]
      : []),
    {
      label: 'Chat',
      icon: MessageSquare,
      path: '/chat',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ]

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen overflow-y-auto fixed left-0 top-16">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-light hover:bg-surface-dark'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-border mt-6 pt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
