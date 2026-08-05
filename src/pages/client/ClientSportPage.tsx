import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Send, Eye, ImagePlus, X, Loader2, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchSportTickets,
  createSportTicket,
  replySportTicket,
} from '../../redux/slices/sportSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { formatDateTime, formatDate } from '../../lib/utils'
import type { SportTicket } from '../../types'

const schema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(3, 'Description is required'),
  category: z.string().min(1, 'Select a category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
})
type FormValues = z.infer<typeof schema>

export default function ClientSportPage() {
  const dispatch = useAppDispatch()
  const { tickets, loading } = useAppSelector((s) => s.sport)
  const { projects } = useAppSelector((s) => s.projects)
  const { user } = useAppSelector((s) => s.auth)

  const [createOpen, setCreateOpen] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [createScreenshots, setCreateScreenshots] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [selected, setSelected] = useState<SportTicket | null>(null)
  const [reply, setReply] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [replyScreenshots, setReplyScreenshots] = useState<string[]>([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', category: 'General' },
  })

  useEffect(() => {
    dispatch(fetchSportTickets(user?._id))
    dispatch(fetchProjects())
  }, [dispatch, user?._id])

  const uploadScreenshot = async (file: File, ownerId: string, isReply: boolean) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerId', ownerId || user?._id || '')
      const res = await apiClient.uploadDocument(formData)
      const url = res.data?.url || res.data?.document?.url || res.data?.data?.url || ''
      if (!url) throw new Error('Upload failed: no URL returned')
      if (isReply) setReplyScreenshots((prev) => [...prev, url])
      else setCreateScreenshots((prev) => [...prev, url])
      toast.success('Screenshot uploaded')
    } catch (error) {
      toast.error(apiClient.getErrorMessage(error) || 'Failed to upload screenshot')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadScreenshot(file, user?._id || '', false)
    e.target.value = ''
  }

  const handleReplyFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadScreenshot(file, selected?.clientId || '', true)
    e.target.value = ''
  }

  const onSubmit = async (values: FormValues) => {
    if (!projectId) {
      toast.error('Select a project')
      return
    }
    setIsCreating(true)
    try {
      const project = projects.find((p) => p._id === projectId)
      await dispatch(
        createSportTicket({
          ...values,
          clientId: user?._id,
          clientName: user?.name,
          projectId,
          projectName: project?.title || 'Project',
          createdBy: user?._id,
          createdByName: user?.name,
          status: 'not-picked-up',
          screenshots: createScreenshots.length ? createScreenshots : undefined,
        })
      ).unwrap()
      toast.success('Sport ticket created')
      setCreateOpen(false)
      setProjectId('')
      setCreateScreenshots([])
      reset()
    } catch (error) {
      toast.error('Failed to create sport ticket')
    } finally {
      setIsCreating(false)
    }
  }

  const open = (t: SportTicket) => {
    setSelected(t)
    setReply('')
    setReplyScreenshots([])
  }

  const sendReply = async () => {
    if (!selected || !reply.trim()) return
    setIsReplying(true)
    try {
      const updated = await dispatch(
        replySportTicket({ id: selected._id, message: reply, screenshots: replyScreenshots.length ? replyScreenshots : undefined })
      ).unwrap()
      setSelected(updated)
      setReply('')
      setReplyScreenshots([])
      toast.success('Reply sent')
    } catch (error) {
      toast.error('Failed to send reply')
    } finally {
      setIsReplying(false)
    }
  }

  const columns: Column<SportTicket>[] = [
    {
      header: 'Subject',
      accessor: 'subject',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.subject}</p>
          <p className="text-xs text-muted-foreground">{row.category}</p>
        </div>
      ),
    },
    {
      header: 'Project',
      accessor: 'projectName',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.projectName}</p>
          <p className="text-xs text-muted-foreground">{row.clientName}</p>
        </div>
      ),
    },
    { header: 'Priority', accessor: 'priority', cell: (row) => <StatusBadge status={row.priority} /> },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Created', accessor: 'createdAt', cell: (row) => formatDate(row.createdAt), sortable: true },
    {
      header: '',
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => open(row)} aria-label="View">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Sport Support" subtitle="Raise any query or issue directly. Our team will respond on this ticket.">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Query
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit a Query</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project *</label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject *</label>
                <Input {...register('subject')} placeholder="Brief summary" />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select {...register('category')} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                    <option>General</option><option>Technical</option><option>Billing</option><option>Feature Request</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select {...register('priority')} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea rows={4} {...register('description')} placeholder="Describe your query or issue..." />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              {createScreenshots.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {createScreenshots.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt={`create-${i}`} className="h-16 w-16 rounded-lg border border-border object-cover" />
                      <button
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white"
                        onClick={() => setCreateScreenshots((prev) => prev.filter((_, j) => j !== i))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <input type="file" accept="image/*" id="client-sport-create-screenshot" className="hidden" onChange={handleCreateFile} />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('client-sport-create-screenshot')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    Add Screenshot
                  </Button>
                </div>
                <Button type="submit" disabled={isCreating || !projectId}>
                  {isCreating ? 'Submitting...' : 'Submit Query'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          searchPlaceholder="Search your queries..."
          searchKeys={['subject', 'description', 'projectName']}
          emptyState={
            <EmptyState
              icon={<Trophy className="h-6 w-6" />}
              title="No queries yet"
              description="Submit a query and our team will respond here."
            />
          }
        />
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate pr-6">{selected.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <StatusBadge status={selected.priority} />
                  <span className="text-xs text-text-light">{selected.category}</span>
                  <span className="text-xs text-text-light">· {selected.projectName}</span>
                  <span className="text-xs text-text-light">· {formatDateTime(selected.createdAt)}</span>
                </div>

                <p className="rounded-lg bg-muted p-3 text-sm">{selected.description}</p>

                {selected.screenshots && selected.screenshots.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-text-light">Screenshots</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.screenshots.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`screenshot-${i}`} className="h-20 w-20 rounded-lg border border-border object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {selected.replies.map((r, i) => (
                    <div key={i} className="rounded-lg border border-border p-3 text-sm">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-xs font-medium text-primary">{r.authorName}</p>
                        <span className="text-xs text-text-light">{formatDateTime(r.createdAt)}</span>
                      </div>
                      <p>{r.message}</p>
                      {r.screenshots && r.screenshots.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.screenshots.map((url, j) => (
                            <a key={j} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={`reply-screenshot-${j}`} className="h-16 w-16 rounded border border-border object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {selected.replies.length === 0 && (
                    <p className="py-2 text-center text-xs text-text-light">No replies yet.</p>
                  )}
                </div>

                {selected.status !== 'resolved' && selected.status !== 'suspended' && (
                  <div className="space-y-2">
                    <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." rows={3} />
                    {replyScreenshots.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {replyScreenshots.map((url, i) => (
                          <div key={i} className="relative">
                            <img src={url} alt={`upload-${i}`} className="h-16 w-16 rounded-lg border border-border object-cover" />
                            <button
                              className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white"
                              onClick={() => setReplyScreenshots((prev) => prev.filter((_, j) => j !== i))}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <input type="file" accept="image/*" id="client-sport-reply-screenshot" className="hidden" onChange={handleReplyFile} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('client-sport-reply-screenshot')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                          Screenshot
                        </Button>
                      </div>
                      <Button size="sm" onClick={sendReply} disabled={isReplying || !reply.trim()}>
                        <Send className="h-4 w-4" /> Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {!selected && (
            <div className="flex items-center justify-center py-8">
              <Skeleton className="h-40 w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
