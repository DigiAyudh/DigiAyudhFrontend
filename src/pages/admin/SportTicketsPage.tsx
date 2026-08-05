import { useEffect, useState } from 'react'
import { Eye, Send, ImagePlus, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchSportTickets,
  replySportTicket,
  updateSportTicket,
} from '../../redux/slices/sportSlice'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

const STATUSES = ['not-picked-up', 'in-review', 'resolved', 'suspended']

export default function SportTicketsPage() {
  const dispatch = useAppDispatch()
  const { tickets, loading } = useAppSelector((s) => s.sport)
  const { user } = useAppSelector((s) => s.auth)
  const [selected, setSelected] = useState<SportTicket | null>(null)
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState('not-picked-up')
  const [isReplying, setIsReplying] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [replyScreenshots, setReplyScreenshots] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    dispatch(fetchSportTickets(undefined))
  }, [dispatch])

  const open = (t: SportTicket) => {
    setSelected(t)
    setStatus(t.status)
    setReply('')
    setReplyScreenshots([])
  }

  const uploadScreenshot = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerId', selected?.clientId || user?._id || '')
      const res = await apiClient.uploadDocument(formData)
      const url = res.data?.url || res.data?.document?.url || res.data?.data?.url || ''
      if (!url) throw new Error('Upload failed: no URL returned')
      setReplyScreenshots((prev) => [...prev, url])
      toast.success('Screenshot uploaded')
    } catch (error) {
      toast.error(apiClient.getErrorMessage(error) || 'Failed to upload screenshot')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadScreenshot(file)
    e.target.value = ''
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

  const saveStatus = async () => {
    if (!selected) return
    setIsSavingStatus(true)
    try {
      const updated = await dispatch(
        updateSportTicket({ id: selected._id, data: { status } })
      ).unwrap()
      setSelected(updated)
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsSavingStatus(false)
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
      header: 'Client',
      accessor: 'clientName',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.clientName}</p>
          <p className="text-xs text-muted-foreground">{row.projectName}</p>
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
      <PageHeader title="Sport Tickets" subtitle="Manage client support tickets across projects." />

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          searchPlaceholder="Search tickets..."
          searchKeys={['subject', 'description', 'clientName', 'projectName']}
          exportFileName="sport-tickets"
          emptyState={
            <EmptyState
              icon={<Send className="h-6 w-6" />}
              title="No sport tickets"
              description="Client support tickets will appear here once clients raise them."
            />
          }
        />
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2 pr-6">
                  <span className="truncate">{selected.subject}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <StatusBadge status={selected.priority} />
                  <span className="text-xs text-text-light">{selected.category}</span>
                  <span className="text-xs text-text-light">· {selected.clientName}</span>
                  <span className="text-xs text-text-light">· {selected.projectName}</span>
                  <span className="text-xs text-text-light">· Created {formatDateTime(selected.createdAt)}</span>
                </div>

                {/* Description */}
                <p className="rounded-lg bg-muted p-3 text-sm">{selected.description}</p>

                {/* Ticket-level screenshots */}
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

                {/* Replies */}
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

                {/* Reply composer */}
                <div className="space-y-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                  />
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
                      <input
                        type="file"
                        accept="image/*"
                        id="admin-reply-screenshot"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById('admin-reply-screenshot')?.click()}
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

                {/* Status control */}
                <div className="flex items-center justify-between gap-3 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s.replace(/-/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" onClick={saveStatus} disabled={isSavingStatus || status === selected.status}>
                    {isSavingStatus ? 'Saving...' : 'Update Status'}
                  </Button>
                </div>
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

      {loading && tickets.length === 0 && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}
    </div>
  )
}

