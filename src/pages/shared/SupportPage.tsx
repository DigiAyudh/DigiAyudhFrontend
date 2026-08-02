import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, LifeBuoy, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchTickets, createTicket, replyTicket } from '../../redux/slices/supportSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../components/ui/dialog'
import { FormField } from '../../components/common/FormField'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { Skeleton } from '../../components/ui/skeleton'
import { formatRelativeTime } from '../../utils/helpers'
import type { SupportTicket } from '../../types'

const schema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  category: z.string().min(1, 'Select a category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().min(10, 'Please describe your issue'),
})
type FormValues = z.infer<typeof schema>

export default function SupportPage() {
  const dispatch = useAppDispatch()
  const { tickets, loading } = useAppSelector((s) => s.support)
  const { user } = useAppSelector((s) => s.auth)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<SupportTicket | null>(null)
  const [reply, setReply] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', category: 'General' },
  })

  useEffect(() => {
    dispatch(fetchTickets(undefined))
  }, [dispatch])

  const onSubmit = async (values: FormValues) => {
    await dispatch(createTicket({
      ...values,
      createdBy: user?._id,
      createdByName: user?.name,
    })).unwrap()
    toast.success('Ticket created')
    reset()
    setOpen(false)
  }

  const sendReply = async () => {
    if (!active || !reply.trim()) return
    const updated = await dispatch(replyTicket({ id: active._id, message: reply })).unwrap()
    setActive(updated)
    setReply('')
    toast.success('Reply sent')
  }

  return (
    <div>
      <PageHeader title="Support" subtitle="Raise and track support tickets.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
              <div className="py-4">
                <FormField label="Subject" error={errors.subject?.message}>
                  <Input {...register('subject')} placeholder="Brief summary" />
                </FormField>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <FormField label="Category" error={errors.category?.message}>
                    <select {...register('category')} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                      <option>General</option><option>Technical</option><option>Billing</option><option>Feature Request</option>
                    </select>
                  </FormField>
                  <FormField label="Priority" error={errors.priority?.message}>
                    <select {...register('priority')} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                  </FormField>
                </div>
                <div className="mt-4">
                  <FormField label="Description" error={errors.description?.message}>
                    <Textarea rows={4} {...register('description')} placeholder="Describe your issue..." />
                  </FormField>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" loading={isSubmitting}>Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {loading && tickets.length === 0 ? (
        <div className="mt-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className={`h-20 ${i > 0 ? 'mt-3' : ''}`} />)}</div>
      ) : tickets.length === 0 ? (
        <div className="mt-5">
          <EmptyState icon={<LifeBuoy className="h-6 w-6" />} title="No tickets yet" description="Create a ticket to get help from our team." />
        </div>
      ) : (
        <div className="mt-5">
          {tickets.map((t, idx) => (
            <Card key={t._id} className={`cursor-pointer transition-shadow hover:shadow-md ${idx > 0 ? 'mt-3' : ''}`} onClick={() => setActive(t)}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.subject}</p>
                  <p className="text-xs text-text-light">{t.category} · {formatRelativeTime(t.createdAt)} · {t.replies.length} replies</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && (
            <>
              <DialogHeader><DialogTitle>{active.subject}</DialogTitle></DialogHeader>
              <div className="py-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={active.status} />
                  <StatusBadge status={active.priority} />
                  <span className="text-xs text-text-light">{active.category}</span>
                </div>
                <p className="mt-3 rounded-lg bg-muted p-3 text-sm">{active.description}</p>
                <div className="mt-3 max-h-56 overflow-y-auto">
                  {active.replies.map((r, i) => (
                    <div key={i} className={`rounded-lg border border-border p-3 text-sm ${i > 0 ? 'mt-2' : ''}`}>
                      <p className="mb-1 text-xs font-medium text-primary">{r.authorName}</p>
                      {r.message}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." />
                  <Button size="icon" onClick={sendReply} aria-label="Send reply"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}