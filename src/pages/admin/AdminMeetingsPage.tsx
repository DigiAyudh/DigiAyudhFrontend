import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Video, Plus, Edit2, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchMeetings } from '../../redux/slices/businessSlice'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { formatDateTime } from '../../lib/utils'
import type { Meeting } from '../../types'

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start: z.string().min(1, 'Start date and time is required'),
  end: z.string().min(1, 'End date and time is required'),
  location: z.string().optional(),
  link: z.string().optional(),
  attendees: z.string().optional(),
})

type MeetingFormData = z.infer<typeof meetingSchema>

export default function AdminMeetingsPage() {
  const dispatch = useAppDispatch()
  const { meetings, loading } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
  })

  useEffect(() => {
    dispatch(fetchMeetings())
  }, [dispatch])

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true)
    try {
      const meetingData = {
        title: data.title,
        description: data.description,
        start: new Date(data.start),
        end: new Date(data.end),
        location: data.location,
        link: data.link,
        attendees: data.attendees ? data.attendees.split(',').map((a) => a.trim()) : [user?._id || ''],
        organizerId: user?._id,
        status: 'scheduled',
      }

      if (editingId) {
        await apiClient.updateMeeting(editingId, meetingData)
        toast.success('Meeting updated successfully')
      } else {
        await apiClient.createMeeting(meetingData)
        toast.success('Meeting created successfully')
      }

      dispatch(fetchMeetings())
      setIsOpen(false)
      setEditingId(null)
      reset()
    } catch (error) {
      toast.error('Failed to save meeting')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (meeting: Meeting) => {
    setEditingId(meeting._id)
    reset({
      title: meeting.title,
      description: meeting.description,
      start: meeting.start.toString().slice(0, 16),
      end: meeting.end.toString().slice(0, 16),
      location: meeting.location,
      link: meeting.link,
      attendees: meeting.attendees?.join(', '),
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return

    try {
      await apiClient.deleteMeeting(id)
      toast.success('Meeting deleted successfully')
      dispatch(fetchMeetings())
    } catch (error) {
      toast.error('Failed to delete meeting')
    }
  }

  const sorted = [...meetings].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Meetings" subtitle="Schedule and manage team meetings." />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                reset()
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Meeting' : 'Create New Meeting'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update meeting details' : 'Schedule a new meeting with attendees'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Project Planning Session"
                  {...register('title')}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Meeting agenda and notes"
                  rows={3}
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Date & Time *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    {...register('start')}
                  />
                  {errors.start && <p className="text-xs text-destructive">{errors.start.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Date & Time *</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    {...register('end')}
                  />
                  {errors.end && <p className="text-xs text-destructive">{errors.end.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Conference Room A"
                    {...register('location')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Video Call Link</Label>
                  <Input
                    id="link"
                    placeholder="https://zoom.us/..."
                    {...register('link')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendees">Attendees (Email addresses, comma-separated)</Label>
                <Textarea
                  id="attendees"
                  placeholder="john@example.com, jane@example.com"
                  rows={2}
                  {...register('attendees')}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    setEditingId(null)
                    reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Meeting' : 'Create Meeting'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && meetings.length === 0 ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No meetings scheduled" description="Create a new meeting to get started." />
      ) : (
        <div className="space-y-3">
          {sorted.map((m) => (
            <Card key={m._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-medium">{new Date(m.start).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(m.start).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{m.title}</h3>
                        <StatusBadge status={m.status} />
                      </div>
                      {m.description && <p className="truncate text-sm text-text-light mt-1">{m.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-light">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDateTime(m.start)}
                        </span>
                        {m.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {m.location}
                          </span>
                        )}
                        {m.link && (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" /> Online
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="Edit meeting"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      aria-label="Delete meeting"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
