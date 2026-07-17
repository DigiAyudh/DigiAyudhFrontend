import { useEffect } from 'react'
import { Calendar, Clock, MapPin, Video } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchMeetings } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import { formatDate, formatDateTime } from '../../lib/utils'

export default function MeetingsPage() {
  const dispatch = useAppDispatch()
  const { meetings, loading } = useAppSelector((s) => s.business)

  useEffect(() => {
    dispatch(fetchMeetings())
  }, [dispatch])

  const sorted = [...meetings].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" subtitle="Your scheduled calls and appointments." />

      {loading && meetings.length === 0 ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No meetings scheduled" description="New meetings will appear here." />
      ) : (
        <div className="space-y-3">
          {sorted.map((m) => (
            <Card key={m._id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium">{new Date(m.start).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(m.start).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{m.title}</h3>
                    <StatusBadge status={m.status} />
                  </div>
                  {m.description && <p className="truncate text-sm text-text-light">{m.description}</p>}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-light">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDateTime(m.start)}</span>
                    {m.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.location}</span>}
                    {m.link && <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Online</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
