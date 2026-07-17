import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { logout } from '../redux/slices/authSlice'
import { Bell, LogOut, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { unreadCount } = useAppSelector((state) => state.notifications)
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard'
    if (user?.role === 'employee') return '/employee/dashboard'
    if (user?.role === 'client') return '/client/dashboard'
    return '/'
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={() => navigate(getDashboardPath())} className="flex items-center gap-2 hover:opacity-80">
            <img src="/digiayudh-logo.jpeg" alt="DigiAyudh" className="h-8 w-8" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DigiAyudh
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-text-light hover:text-text transition"
                >
                  Chat
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-text-light hover:text-text transition"
                >
                  Projects
                </button>
                {user.role === 'admin' && (
                  <>
                    <button
                      onClick={() => navigate('/leads')}
                      className="text-text-light hover:text-text transition"
                    >
                      Leads
                    </button>
                    <button
                      onClick={() => navigate('/reports')}
                      className="text-text-light hover:text-text transition"
                    >
                      Reports
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <button
                  onClick={() => navigate('/chat')}
                  className="relative p-2 text-text-light hover:text-text hover:bg-surface rounded-lg transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="p-2 text-text-light hover:text-text hover:bg-surface rounded-lg transition"
                >
                  <Settings size={20} />
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 text-text-light hover:text-red-500 hover:bg-surface rounded-lg transition"
                >
                  <LogOut size={20} />
                </button>

                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-text-light hover:bg-surface rounded-lg transition"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && user && (
          <div className="md:hidden border-t border-border py-2">
            <button
              onClick={() => {
                navigate('/chat')
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-text-light hover:bg-surface"
            >
              Chat
            </button>
            <button
              onClick={() => {
                navigate('/projects')
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-text-light hover:bg-surface"
            >
              Projects
            </button>
            {user.role === 'admin' && (
              <>
                <button
                  onClick={() => {
                    navigate('/leads')
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-text-light hover:bg-surface"
                >
                  Leads
                </button>
                <button
                  onClick={() => {
                    navigate('/reports')
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-text-light hover:bg-surface"
                >
                  Reports
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
