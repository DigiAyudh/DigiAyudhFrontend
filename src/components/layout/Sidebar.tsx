import { NavLink } from 'react-router-dom'
import { Layers, X } from 'lucide-react'
import { navByRole } from '../../config/navigation'
import { useAppSelector } from '../../redux/hooks'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../types'

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: UserRole
  open: boolean
  onClose: () => void
}) {
  const sections = navByRole[role]
  const contactRequests = useAppSelector((s) =>
    s.contact.requests.filter((r) => r.status === 'new').length
  )
  const pendingClients = useAppSelector((s) =>
    s.clients.clients.filter((c) => c.verificationStatus === 'pending').length
  )
  const notifications = useAppSelector((s) => s.notifications.unreadCount)

  const badges: Record<string, number> = { contactRequests, pendingClients, notifications }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          
          <NavLink
  to={`/${role}`}
  className="flex items-center gap-2"
>
  <img
    src="/digiayudh-logo.jpeg"
    alt="DigiAyudh Logo"
    className="h-8 w-8 rounded-lg object-cover"
  />

  <span className="text-lg font-bold text-sidebar-foreground">
    DigiAyudh
  </span>
</NavLink>
          <button className="text-text-muted lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {section.title}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const badge = item.badgeKey ? badges[item.badgeKey] : 0
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === `/${role}`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-text-muted hover:bg-muted hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
