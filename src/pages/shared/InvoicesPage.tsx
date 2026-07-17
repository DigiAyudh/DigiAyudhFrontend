import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchInvoices } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable } from '../../components/common/DataTable'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { StatusBadge } from '../../components/common/StatusBadge'
import { StatCard } from '../../components/common/StatCard'
import { FileText, DollarSign, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { formatCurrency, formatDate } from '../../lib/utils'
import type { Invoice } from '../../types'

const invoiceSchema = z.object({
  number: z.string().min(1, 'Invoice number is required'),
  clientName: z.string().min(1, 'Client name is required'),
  amount: z.string().min(1, 'Amount is required'),
  tax: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

export default function InvoicesPage() {
  const dispatch = useAppDispatch()
  const { invoices, loading } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const isAdmin = user?.role === 'admin'

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  })

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      if (editingId) {
        toast.success('Invoice updated successfully')
      } else {
        toast.success('Invoice created successfully')
      }
      setIsOpen(false)
      setEditingId(null)
      reset()
    } catch (error) {
      toast.error('Failed to save invoice')
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingId(invoice._id)
    reset({
      number: invoice.number,
      clientName: invoice.clientName,
      amount: invoice.total.toString(),
      tax: invoice.tax.toString(),
      status: invoice.status,
      issueDate: invoice.issueDate?.toString().split('T')[0],
      dueDate: invoice.dueDate?.toString().split('T')[0],
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this invoice?')) {
      toast.success('Invoice deleted successfully')
    }
  }

  const total = invoices.reduce((sum, i) => sum + i.total, 0)
  const paid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
  const overdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Invoices" subtitle="Billing history and payment status." />
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingId(null)
                reset()
              }} className="gap-2">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update invoice details' : 'Create a new invoice for a client'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Invoice Number *</Label>
                    <Input {...register('number')} placeholder="INV-001" />
                    {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input {...register('clientName')} placeholder="Client name" />
                    {errors.clientName && <p className="text-xs text-destructive">{errors.clientName.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input type="number" {...register('amount')} placeholder="0.00" step="0.01" />
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax</Label>
                    <Input type="number" {...register('tax')} placeholder="0.00" step="0.01" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input type="date" {...register('issueDate')} />
                    {errors.issueDate && <p className="text-xs text-destructive">{errors.issueDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input type="date" {...register('dueDate')} />
                    {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select {...register('status')} className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background">
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingId ? 'Update Invoice' : 'Create Invoice'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard stat={{ label: 'Total Billed', value: total, change: 0, trend: 'up', format: 'currency' }} icon={FileText} index={0} />
        <StatCard stat={{ label: 'Paid', value: paid, change: 0, trend: 'up', format: 'currency' }} icon={DollarSign} index={1} />
        <StatCard stat={{ label: 'Overdue', value: overdue, change: 0, trend: 'down', format: 'currency' }} icon={AlertCircle} index={2} />
      </div>

      <DataTable<Invoice>
        data={invoices}
        loading={loading}
        searchKeys={['number', 'clientName']}
        searchPlaceholder="Search invoices..."
        exportFileName="invoices"
        columns={[
          { header: 'Invoice', accessor: 'number', sortable: true, cell: (r) => <span className="font-medium">{r.number}</span> },
          { header: 'Client', accessor: 'clientName', sortable: true },
          { header: 'Issued', accessor: 'issueDate', sortable: true, cell: (r) => formatDate(r.issueDate) },
          { header: 'Due', accessor: 'dueDate', sortable: true, cell: (r) => formatDate(r.dueDate) },
          { header: 'Amount', accessor: 'total', sortable: true, cell: (r) => <span className="font-medium">{formatCurrency(r.total)}</span> },
          { header: 'Status', accessor: 'status', cell: (r) => <StatusBadge status={r.status} /> },
          ...(isAdmin ? [{
            header: '',
            cell: (row: Invoice) => (
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(row._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          }] : []),
        ]}
      />
    </div>
  )
}
