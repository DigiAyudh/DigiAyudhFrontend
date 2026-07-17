import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchContactRequests, updateContactRequest } from '../../redux/slices/contactSlice'
import type { ContactRequest } from '../../types'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Button } from '../../components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'
import { FormField } from '../../components/common/FormField'
import { formatDate } from '../../lib/utils'

const STATUSES = ['new', 'in-review', 'responded', 'closed']

export default function ContactRequestsPage() {
  const dispatch = useAppDispatch()
  const { requests, loading } = useAppSelector((s) => s.contact)
  const [selected, setSelected] = useState<ContactRequest | null>(null)
  const [status, setStatus] = useState<string>('new')

  useEffect(() => {
    dispatch(fetchContactRequests())
  }, [dispatch])

  const open = (r: ContactRequest) => {
    setSelected(r)
    setStatus(r.status)
  }

  const saveStatus = async () => {
    if (!selected) return
    await dispatch(updateContactRequest({ id: selected._id, data: { status } }))
    toast.success('Request updated')
    setSelected(null)
  }

  const columns: Column<ContactRequest>[] = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { header: 'Subject', accessor: 'subject', sortable: true },
    { header: 'Company', accessor: 'company', cell: (row) => row.company || '—' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Received', accessor: 'createdAt', cell: (row) => formatDate(row.createdAt), sortable: true },
    {
      header: '',
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => open(row)} aria-label="View"><Eye className="h-4 w-4" /></Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Contact Requests" subtitle="Messages submitted through the website contact form." />

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        searchPlaceholder="Search requests..."
        searchKeys={['name', 'email', 'subject', 'company']}
        exportFileName="contact-requests"
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Name</p><p className="font-medium">{selected.name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selected.phone || '—'}</p></div>
                <div><p className="text-muted-foreground">Company</p><p className="font-medium">{selected.company || '—'}</p></div>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Message</p>
                <p className="rounded-lg bg-muted p-3 text-sm">{selected.message}</p>
              </div>
              <FormField label="Update status">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button onClick={saveStatus}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
