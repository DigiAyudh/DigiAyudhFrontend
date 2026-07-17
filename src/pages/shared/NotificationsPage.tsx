import { useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchNotifications, markAsRead, markAllAsRead } from '../../redux/slices/notificationsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import { cn } from '../../lib/utils'
import { formatRelativeTime } from '../../utils/helpers'

export default function NotificationsPage() {
  const dispatch = useAppDispatch()
  const { notifications, loading, unreadCount } = useAppSelector((s) => s.notifications)
  const { user } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (user?._id) dispatch(fetchNotifications(user._id))
  }, [dispatch, user?._id])

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread`}>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => user?._id && dispatch(markAllAsRead(user._id))}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {loading && notifications.length === 0 ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n._id} className={cn(!n.isRead && 'border-primary/40 bg-primary/5')}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-primary')} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-text-light">{n.message}</p>
                  <p className="mt-1 text-xs text-text-light">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="icon" onClick={() => dispatch(markAsRead(n._id))} aria-label="Mark as read">
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
