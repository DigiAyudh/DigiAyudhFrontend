import { useEffect, useState } from 'react'
import { Plus, Check, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchLeaveRequests, createLeaveRequest, approveLeaveRequest, rejectLeaveRequest } from '../../redux/slices/attendanceSlice'
import { fetchEmployees } from '../../redux/slices/employeesSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'
import { FormField } from '../../components/common/FormField'
import { Textarea } from '../../components/ui/textarea'
import type { LeaveRequest } from '../../redux/slices/attendanceSlice'
import type { Employee } from '../../types'

export default function LeaveRequestsPage() {
  const dispatch = useAppDispatch()
  const { leaveRequests, loading } = useAppSelector((s) => s.attendance)
  const { employees } = useAppSelector((s) => s.employees)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [leaveType, setLeaveType] = useState<'sick' | 'personal' | 'vacation' | 'other'>('personal')
  const [reason, setReason] = useState('')
  const [approving, setApproving] = useState<LeaveRequest | null>(null)
  const [rejecting, setRejecting] = useState<LeaveRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    dispatch(fetchEmployees('digiayudh'))
    dispatch(fetchLeaveRequests('digiayudh'))
  }, [dispatch])

  const handleCreateLeaveRequest = async () => {
    if (!selectedEmployee || !startDate || !endDate || !reason) {
      toast.error('Fill all fields')
      return
    }

    try {
      await dispatch(createLeaveRequest({
        employeeId: selectedEmployee._id,
        employeeName: selectedEmployee.name,
        startDate,
        endDate,
        leaveType,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })).unwrap()
      toast.success('Leave request created')
      setLeaveDialogOpen(false)
      resetForm()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to create leave request')
    }
  }

  const handleApprove = async () => {
    if (!approving) return
    try {
      await dispatch(approveLeaveRequest({ id: approving._id, approvedBy: 'admin' })).unwrap()
      toast.success('Leave approved')
      setApproving(null)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to approve leave')
    }
  }

  const handleReject = async () => {
    if (!rejecting) return
    try {
      await dispatch(rejectLeaveRequest({ id: rejecting._id, reason: rejectionReason })).unwrap()
      toast.success('Leave rejected')
      setRejecting(null)
      setRejectionReason('')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to reject leave')
    }
  }

  const resetForm = () => {
    setSelectedEmployee(null)
    setStartDate('')
    setEndDate('')
    setLeaveType('personal')
    setReason('')
  }

  const columns: Column<LeaveRequest>[] = [
    { header: 'Employee', accessor: 'employeeName', sortable: true },
    { header: 'Leave Type', accessor: 'leaveType', sortable: true },
    { header: 'From Date', accessor: 'startDate' },
    { header: 'To Date', accessor: 'endDate' },
    {
      header: 'Reason',
      accessor: 'reason',
      cell: (row) => <span className="max-w-xs truncate">{row.reason}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge
          variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'destructive' : 'outline'}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: '',
      cell: (row) => {
        if (row.status !== 'pending') return null
        return (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setApproving(row)}
              className="text-green-600"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRejecting(row)}
              className="text-red-600"
              title="Reject"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const pendingRequests = leaveRequests.filter((l) => l.status === 'pending')
  const approvedRequests = leaveRequests.filter((l) => l.status === 'approved')

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" subtitle="Manage employee leave requests and approvals.">
        <Button onClick={() => setLeaveDialogOpen(true)}><Plus className="h-4 w-4" /> New Leave Request</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-3xl font-bold">{pendingRequests.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold">{approvedRequests.length}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-3xl font-bold">{leaveRequests.length}</p>
            </div>
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leaveRequests}
        loading={loading}
        searchPlaceholder="Search by employee name..."
        searchKeys={['employeeName', 'leaveType']}
        exportFileName="leave-requests"
      />

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label="Employee">
              <Select value={selectedEmployee?._id || ''} onValueChange={(id) => setSelectedEmployee(employees.find((e) => e._id === id) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => e.isActive).map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Leave Type">
              <Select value={leaveType} onValueChange={(t) => setLeaveType(t as 'sick' | 'personal' | 'vacation' | 'other')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Start Date">
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </FormField>
              <FormField label="End Date">
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </FormField>
            </div>

            <FormField label="Reason">
              <Textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="Reason for leave..."
                className="min-h-24"
              />
            </FormField>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setLeaveDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleCreateLeaveRequest}>Create Request</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!approving}
        onOpenChange={(o) => !o && setApproving(null)}
        title="Approve Leave Request?"
        description={`Approve leave request for ${approving?.employeeName} from ${approving?.startDate} to ${approving?.endDate}?`}
        confirmLabel="Approve"
        onConfirm={handleApprove}
      />

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rejecting leave for <span className="font-medium">{rejecting?.employeeName}</span>
            </p>
            <FormField label="Rejection Reason">
              <Textarea 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)} 
                placeholder="Reason for rejection..."
                className="min-h-24"
              />
            </FormField>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
              <Button onClick={handleReject} variant="destructive">Reject</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
