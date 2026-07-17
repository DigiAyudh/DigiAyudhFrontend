import { useEffect, useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchAuditLogs } from '../../redux/slices/businessSlice'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import type { AuditLog } from '../../types'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { Badge } from '../../components/ui/badge'
import { formatDateTime } from '../../lib/utils'

export default function AuditLogsPage() {
  const dispatch = useAppDispatch()
  const { auditLogs } = useAppSelector((s) => s.business)
  const [logs, setLogs] = useState<AuditLog[]>(auditLogs)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDetails, setEditDetails] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAuditLogs())
    setLogs(auditLogs)
  }, [dispatch, auditLogs])

  const handleEditLog = (log: AuditLog) => {
    setEditingId(log._id)
    setEditDetails(log.details || '')
    setIsOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    setLogs(logs.map((log) =>
      log._id === editingId ? { ...log, details: editDetails } : log
    ))
    toast.success('Log updated successfully')
    setIsOpen(false)
    setEditingId(null)
    setEditDetails('')
  }

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Delete this audit log entry? This action cannot be undone.')) {
      setLogs(logs.filter((l) => l._id !== id))
      toast.success('Log deleted')
    }
  }

  const columns: Column<AuditLog>[] = [
    { header: 'User', accessor: 'actorName', sortable: true },
    { header: 'Action', accessor: 'action', cell: (row) => <Badge variant="outline">{row.action}</Badge> },
    { header: 'Entity', accessor: 'entity', sortable: true },
    { header: 'Details', accessor: 'details', cell: (row) => <span className="text-muted-foreground">{row.details || '—'}</span> },
    { header: 'IP', accessor: 'ipAddress', cell: (row) => row.ipAddress || '—' },
    { header: 'Time', accessor: 'createdAt', cell: (row) => formatDateTime(row.createdAt), sortable: true },
    {
      header: '',
      cell: (row: AuditLog) => (
        <div className="flex gap-2 justify-end">
          <Dialog open={isOpen && editingId === row._id} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) setEditingId(null)
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" onClick={() => handleEditLog(row)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Log Details</DialogTitle>
                <DialogDescription>
                  Update the details of this audit log entry
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2 bg-muted p-3 rounded-lg">
                  <p className="text-xs font-semibold text-text-light">ACTION</p>
                  <p className="text-sm">{row.action.toUpperCase()} - {row.entity}</p>
                </div>
                <div className="space-y-2 bg-muted p-3 rounded-lg">
                  <p className="text-xs font-semibold text-text-light">ACTOR</p>
                  <p className="text-sm">{row.actorName}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    id="details"
                    rows={4}
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    placeholder="Enter or update log details..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => handleDeleteLog(row._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="A chronological record of system activity with edit and delete capabilities." />
      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search logs..."
        searchKeys={['actorName', 'action', 'entity', 'details']}
        exportFileName="audit-logs"
        pageSize={12}
      />
    </div>
  )
}
