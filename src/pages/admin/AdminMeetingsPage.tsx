import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Video, Plus, Edit2, Trash2, Users, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchMeetings, createMeeting, updateMeeting, deleteMeeting } from '../../redux/slices/businessSlice'
import { fetchEmployees } from '../../redux/slices/employeesSlice'
import { fetchClients } from '../../redux/slices/clientsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { formatDateTime } from '../../lib/utils'
import type { Meeting } from '../../types'

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start: z.string().min(1, 'Start date and time is required'),
  end: z.string().min(1, 'End date and time is required'),
  location: z.string().optional(),
  link: z.string().optional(),
  type: z.enum(['team', 'client']),
  employeeIds: z.array(z.string()).optional(),
  clientIds: z.array(z.string()).optional(),
})

type MeetingFormData = z.infer<typeof meetingSchema>

export default function AdminMeetingsPage() {
  const dispatch = useAppDispatch()
  const { meetings, loading } = useAppSelector((s) => s.business)
  const { employees } = useAppSelector((s) => s.employees)
  const { clients } = useAppSelector((s) => s.clients)
  const { user } = useAppSelector((s) => s.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState<Meeting | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      type: 'team',
      employeeIds: [],
      clientIds: [],
    },
  })

  const meetingType = watch('type')

  useEffect(() => {
    dispatch(fetchEmployees(('digiayudh')))
dispatch(fetchClients(user?.companyName))
    dispatch(fetchMeetings())
  }, [dispatch])

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true)
    try {
      const meetingData: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        start: new Date(data.start),
        end: new Date(data.end),
        location: data.location,
        link: data.link,
        type: data.type,
        organizerId: user?._id,
        organizerName: user?.name,
      }

      if (data.type === 'team') {
        meetingData.attendees = selectedEmployees
      } else {
        meetingData.clientIds = selectedClients
      }

      if (editingId) {
        await dispatch(updateMeeting({ id: editingId, data: meetingData })).unwrap()
        toast.success('Meeting updated successfully')
      } else {
        await dispatch(createMeeting(meetingData)).unwrap()
        toast.success('Meeting created successfully')
      }

      dispatch(fetchMeetings())
      setIsOpen(false)
      setEditingId(null)
      setSelectedEmployees([])
      setSelectedClients([])
      reset()
    } catch (error) {
      toast.error('Failed to save meeting')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (meeting: Meeting) => {
    setEditingId(meeting._id)
    const startDate = new Date(meeting.start)
    const endDate = new Date(meeting.end)

    if (meeting.type === 'team') {
      setSelectedEmployees(meeting.attendees || [])
    } else {
      setSelectedClients(meeting.clientIds || [])
    }

    reset({
      title: meeting.title,
      description: meeting.description,
      start: startDate.toISOString().slice(0, 16),
      end: endDate.toISOString().slice(0, 16),
      location: meeting.location,
      link: meeting.link,
      type: meeting.type,
      employeeIds: meeting.attendees,
      clientIds: meeting.clientIds,
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return

    try {
      await dispatch(deleteMeeting(id)).unwrap()
      toast.success('Meeting deleted successfully')
      dispatch(fetchMeetings())
    } catch (error) {
      toast.error('Failed to delete meeting')
    }
  }

 const handleSelectAllEmployees = () => {
  const allIds = employees.filter((e) => e.isActive).map((e) => e._id)
  setSelectedEmployees(allIds)
}

  const handleEmployeeToggle = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    )
  }

  const handleClientToggle = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const meetingsList = Array.isArray(meetings) ? meetings.filter((m) => m && m.start) : []
  const sorted = [...meetingsList].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader title="Meetings" subtitle="Schedule and manage team meetings." />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setSelectedEmployees([])
                setSelectedClients([])
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label htmlFor="type">Meeting Type *</Label>
                <Select
                  value={meetingType}
                  onValueChange={(v) => {
                    reset({ ...watch(), type: v as 'team' | 'client' })
                    setSelectedEmployees([])
                    setSelectedClients([])
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team Meeting</SelectItem>
                    <SelectItem value="client">Client Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Project Planning Session"
                  className="mt-1.5"
                  {...register('title')}
                />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Meeting agenda and notes"
                  className="mt-1.5"
                  {...register('description')}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Start Date & Time *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    className="mt-1.5"
                    {...register('start')}
                  />
                  {errors.start && <p className="mt-1 text-xs text-destructive">{errors.start.message}</p>}
                </div>
                <div>
                  <Label htmlFor="end">End Date & Time *</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    className="mt-1.5"
                    {...register('end')}
                  />
                  {errors.end && <p className="mt-1 text-xs text-destructive">{errors.end.message}</p>}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Conference Room A"
                    className="mt-1.5"
                    {...register('location')}
                  />
                </div>
                <div>
                  <Label htmlFor="link">Video Call Link</Label>
                  <Input
                    id="link"
                    placeholder="https://zoom.us/..."
                    className="mt-1.5"
                    {...register('link')}
                  />
                </div>
              </div>

              {meetingType === 'team' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Select Employees</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllEmployees}
                    >
                      Select All
                    </Button>
                  </div>
                  <div className="mt-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {employees.filter((e) => e.isActive).map((emp, idx) => (
                      <div key={emp._id} className={`flex items-center space-x-2 ${idx > 0 ? 'mt-2' : ''}`}>
                        <Checkbox
                          id={`emp-${emp._id}`}
                          checked={selectedEmployees.includes(emp._id)}
                          onCheckedChange={() => handleEmployeeToggle(emp._id)}
                        />
                        <Label htmlFor={`emp-${emp._id}`} className="text-sm font-normal cursor-pointer">
                          {emp.name} ({emp.email})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {meetingType === 'client' && (
                <div className="mt-4">
                  <Label>Select Clients</Label>
                  <div className="mt-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">

                    {/* {clients.filter((c) => c).map((client) => ( */}

                    {clients.filter((c) => c.verificationStatus === 'verified').map((client, idx) => (

                      <div key={client._id} className={`flex items-center space-x-2 ${idx > 0 ? 'mt-2' : ''}`}>
                        <Checkbox
                          id={`client-${client._id}`}
                          checked={selectedClients.includes(client._id)}
                          onCheckedChange={() => handleClientToggle(client._id)}
                        />
                        <Label htmlFor={`client-${client._id}`} className="text-sm font-normal cursor-pointer">
                          {client.name} ({client.email})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
        <div className="mt-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className={`h-24 ${i > 0 ? 'mt-3' : ''}`} />)}</div>
      ) : sorted.length === 0 ? (
        <div className="mt-5">
          <EmptyState icon={<Calendar className="h-6 w-6" />} title="No meetings scheduled" description="Create a new meeting to get started." />
        </div>
      ) : (
        <div className="mt-5">
          {sorted.map((m, idx) => (
            <Card key={m._id} className={`cursor-pointer hover:shadow-md transition-shadow ${idx > 0 ? 'mt-3' : ''}`} onClick={() => setShowDetails(m)}>
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
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(m)
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Edit meeting"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(m._id)
                    }}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    aria-label="Delete meeting"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
            <div>
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
                <div className="mt-4">
                  <p className="text-xs text-text-light">Description</p>
                  <p className="text-sm">{showDetails.description}</p>
                </div>
              )}

              {showDetails.location && (
                <div className="mt-4">
                  <p className="text-xs text-text-light">Location</p>
                  <p className="text-sm">{showDetails.location}</p>
                </div>
              )}

              {showDetails.link && (
                <div className="mt-4">
                  <p className="text-xs text-text-light">Meeting Link</p>
                  <a href={showDetails.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {showDetails.link}
                  </a>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs text-text-light">Organizer</p>
                <p className="text-sm font-medium">{showDetails.organizerName || 'Admin'}</p>
              </div>

              {showDetails.type === 'team' && showDetails.attendees && (
                <div className="mt-4">
                  <p className="text-xs text-text-light">Participants (Employees)</p>
                  <p className="text-sm">{showDetails.attendees.length} employees invited</p>
                </div>
              )}

              {showDetails.type === 'client' && showDetails.clientIds && (
                <div className="mt-4">
                  <p className="text-xs text-text-light">Participants (Clients)</p>
                  <p className="text-sm">{showDetails.clientIds.length} clients invited</p>
                </div>
              )}

              {showDetails.link && (
                <Button className="mt-4 w-full gap-2" onClick={() => window.open(showDetails.link, '_blank')}>
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