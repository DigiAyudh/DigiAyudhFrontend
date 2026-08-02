import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Video, Users, User } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchMeetings } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { formatDateTime } from '../../lib/utils'
import type { Meeting } from '../../types'

export default function MeetingsPage() {
  const dispatch = useAppDispatch()
  const { meetings, loading } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)
  const [showDetails, setShowDetails] = useState<Meeting | null>(null)

  useEffect(() => {
    dispatch(fetchMeetings(user?._id))
  }, [dispatch, user?._id])

  const meetingsList = Array.isArray(meetings) ? meetings.filter((m) => m && m.start) : []
  const sorted = [...meetingsList].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <div>
      <PageHeader title="Meetings" subtitle="Your scheduled calls and appointments." />

      {loading && meetings.length === 0 ? (
        <div className="mt-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : sorted.length === 0 ? (
        <div className="mt-6"><EmptyState icon={<Calendar className="h-6 w-6" />} title="No meetings scheduled" description="New meetings will appear here." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {sorted.map((m) => (
            <Card key={m._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetails(m)}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium">{new Date(m.start).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(m.start).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{m.title}</h3>
                    <StatusBadge status={m.status} />
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      {m.type === 'team' ? <Users className="h-3 w-3 inline mr-1" /> : <User className="h-3 w-3 inline mr-1" />}
                      {m.type === 'team' ? 'Team' : 'Client'}
                    </span>
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

      {/* Meeting Details Dialog */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showDetails?.title}</DialogTitle>
            <DialogDescription>
              Meeting Details
            </DialogDescription>
          </DialogHeader>
          {showDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-light">Date & Time</p>
                  <p className="text-sm font-medium">{formatDateTime(showDetails.start)} - {formatDateTime(showDetails.end)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-light">Status</p>
                  <StatusBadge status={showDetails.status} />
                </div>
              </div>
              
              {showDetails.description && (
                <div>
                  <p className="text-xs text-text-light">Description</p>
                  <p className="text-sm">{showDetails.description}</p>
                </div>
              )}

              {showDetails.location && (
                <div>
                  <p className="text-xs text-text-light">Location</p>
                  <p className="text-sm">{showDetails.location}</p>
                </div>
              )}

              {showDetails.link && (
                <div>
                  <p className="text-xs text-text-light">Meeting Link</p>
                  <a href={showDetails.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {showDetails.link}
                  </a>
                </div>
              )}

              <div>
                <p className="text-xs text-text-light">Organizer</p>
                <p className="text-sm font-medium">{showDetails.organizerName || 'Admin'}</p>
              </div>

              {showDetails.type === 'team' && showDetails.attendees && (
                <div>
                  <p className="text-xs text-text-light">Participants (Employees)</p>
                  <p className="text-sm">{showDetails.attendees.length} employees invited</p>
                </div>
              )}

              {showDetails.type === 'client' && showDetails.clientIds && (
                <div>
                  <p className="text-xs text-text-light">Participants (Clients)</p>
                  <p className="text-sm">{showDetails.clientIds.length} clients invited</p>
                </div>
              )}

              {showDetails.link && (
                <Button className="w-full gap-2" onClick={() => window.open(showDetails.link, '_blank')}>
                  <Video className="h-4 w-4" />
                  Join Meeting
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}