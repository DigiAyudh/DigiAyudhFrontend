import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchClients, assignClient } from '../../redux/slices/clientsSlice'
import { fetchEmployees } from '../../redux/slices/employeesSlice'
import type { User } from '../../types'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Button } from '../../components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'
import { FormField } from '../../components/common/FormField'
import { getInitials } from '../../lib/utils'

export default function ClientsPage() {
  const dispatch = useAppDispatch()
  const { clients, loading } = useAppSelector((s) => s.clients)
  const { employees } = useAppSelector((s) => s.employees)
  const [assignTarget, setAssignTarget] = useState<User | null>(null)
  const [employeeId, setEmployeeId] = useState('')

  useEffect(() => {
    dispatch(fetchClients())
    dispatch(fetchEmployees('digiayudh'))
  }, [dispatch])

  const submitAssign = async () => {
    if (!assignTarget || !employeeId) return toast.error('Select an employee')
    await dispatch(assignClient({ clientId: assignTarget._id, employeeId }))
    toast.success('Client assigned')
    setAssignTarget(null)
    setEmployeeId('')
  }

  const employeeName = (id?: string) => employees.find((e) => e._id === id)?.name

  const columns: Column<User>[] = [
    {
      header: 'Client',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(row.name)}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Company', accessor: 'companyName', cell: (row) => row.companyName || '—', sortable: true },
    {
      header: 'Status',
      accessor: 'verificationStatus',
      cell: (row) => <StatusBadge status={row.verificationStatus || 'pending'} />,
    },
    {
      header: 'Assigned To',
      cell: (row) => employeeName(row.assignedEmployeeId) || <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      header: '',
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => setAssignTarget(row)}>
          <UserPlus className="h-4 w-4 mr-1" /> Assign
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" subtitle="All registered clients and their account managers." />

      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        searchPlaceholder="Search clients..."
        searchKeys={['name', 'email', 'companyName']}
        exportFileName="clients"
      />

      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign account manager</DialogTitle>
          </DialogHeader>
          <FormField label={`Assign ${assignTarget?.name} to`}>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e._id} value={e._id}>{e.name} — {e.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button onClick={submitAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
