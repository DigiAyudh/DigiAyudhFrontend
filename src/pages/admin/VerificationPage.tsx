import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Building2, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchClients, verifyClient, rejectClient } from '../../redux/slices/clientsSlice'
import type { User } from '../../types'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../../components/ui/dialog'
import { FormField } from '../../components/common/FormField'
import { Textarea } from '../../components/ui/textarea'
import { getInitials, formatDate } from '../../lib/utils'

function ClientCard({ client, onVerify, onReject }: { client: User; onVerify: (c: User) => void; onReject: (c: User) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11"><AvatarFallback>{getInitials(client.name)}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{client.name}</p>
                <p className="text-xs text-muted-foreground">Registered {formatDate(client.createdAt)}</p>
              </div>
            </div>
            <StatusBadge status={client.verificationStatus || 'pending'} />
          </div>
          <div className="grid gap-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" />{client.companyName || '—'}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{client.email}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{client.phone || '—'}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{[client.city, client.country].filter(Boolean).join(', ') || '—'}</p>
          </div>
          {client.verificationStatus === 'pending' && (
            <div className="flex gap-2 pt-1">
              <Button variant="success" size="sm" className="flex-1" onClick={() => onVerify(client)}>
                <Check className="h-4 w-4" /> Verify
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-destructive" onClick={() => onReject(client)}>
                <X className="h-4 w-4" /> Reject
              </Button>
            </div>
          )}
          {client.verificationStatus === 'rejected' && client.rejectionReason && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">Reason: {client.rejectionReason}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function VerificationPage() {
  const dispatch = useAppDispatch()
  const { clients, loading } = useAppSelector((s) => s.clients)
  const [rejectTarget, setRejectTarget] = useState<User | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    dispatch(fetchClients())
  }, [dispatch])

  const handleVerify = async (c: User) => {
    await dispatch(verifyClient(c._id)).unwrap().then(() => toast.success(`${c.name} verified`)).catch(() => toast.error('Failed'))
  }

  const submitReject = async () => {
    if (!rejectTarget) return
    if (!reason.trim()) return toast.error('Please provide a reason')
    await dispatch(rejectClient({ clientId: rejectTarget._id, reason })).unwrap()
      .then(() => toast.success('Client rejected'))
      .catch(() => toast.error('Failed'))
    setRejectTarget(null)
    setReason('')
  }

  const byStatus = (status: string) => clients.filter((c) => (c.verificationStatus || 'pending') === status)
  const pending = byStatus('pending')
  const verified = byStatus('verified')
  const rejected = byStatus('rejected')

  const grid = (list: User[]) =>
    list.length ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <ClientCard key={c._id} client={c} onVerify={handleVerify} onReject={setRejectTarget} />
        ))}
      </div>
    ) : (
      <EmptyState title="Nothing here" description="No clients in this category." />
    )

  return (
    <div className="space-y-6">
      <PageHeader title="Client Verification" subtitle="Review and approve new client registrations." />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verified.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">{loading ? <p className="text-sm text-text-light">Loading...</p> : grid(pending)}</TabsContent>
        <TabsContent value="verified" className="mt-4">{grid(verified)}</TabsContent>
        <TabsContent value="rejected" className="mt-4">{grid(rejected)}</TabsContent>
      </Tabs>

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.name}?</DialogTitle>
            <DialogDescription>Provide a reason. The client will be notified.</DialogDescription>
          </DialogHeader>
          <FormField label="Rejection reason">
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Incomplete company details" rows={4} />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReject}>Reject client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
