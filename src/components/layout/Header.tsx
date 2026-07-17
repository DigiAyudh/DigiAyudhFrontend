import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, LogOut, User, Settings, Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { logout } from '../../redux/slices/authSlice'
import { fetchNotifications, markAsRead, markAllAsRead } from '../../redux/slices/notificationsSlice'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { ThemeToggle } from '../common/ThemeToggle'
import { formatRelativeTime, getInitials } from '../../utils/helpers'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((s) => s.auth)
  const { notifications, unreadCount } = useAppSelector((s) => s.notifications)

  useEffect(() => {
    dispatch(fetchNotifications(user?._id))
  }, [dispatch, user?._id])

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
      <button className="text-text-muted lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          placeholder="Search..."
          className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-muted hover:text-foreground" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={() => dispatch(markAllAsRead(user?._id))}
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-text-muted">No notifications</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n._id}
                    onClick={() => !n.isRead && dispatch(markAsRead(n._id))}
                    className="flex w-full flex-col items-start gap-0.5 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-muted"
                  >
                    <div className="flex w-full items-center gap-2">
                      {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <span className="flex-1 text-sm font-medium">{n.title}</span>
                    </div>
                    <span className="text-xs text-text-muted">{n.message}</span>
                    <span className="text-[11px] text-text-muted">{formatRelativeTime(n.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted" aria-label="Account menu">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImage} alt={user?.name ?? 'User'} />
                <AvatarFallback>{getInitials(user?.name ?? 'U')}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-xs capitalize text-text-muted">{user?.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs font-normal text-text-muted">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/${user?.role}/profile`)}>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/${user?.role}/settings`)}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
