import { useEffect, useState } from 'react'
import { Plus, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchAttendance, markAttendance } from '../../redux/slices/attendanceSlice'
import { fetchEmployees } from '../../redux/slices/employeesSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select'
import { FormField } from '../../components/common/FormField'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import type { Attendance } from '../../redux/slices/attendanceSlice'
import type { Employee } from '../../types'

export default function AttendancePage() {
  const dispatch = useAppDispatch()
  const { attendance, loading } = useAppSelector((s) => s.attendance)
  const { employees } = useAppSelector((s) => s.employees)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [markDialogOpen, setMarkDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [status, setStatus] = useState<'present' | 'absent'>('present')
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')

  useEffect(() => {
    dispatch(fetchEmployees('digiayudh'))
    dispatch(fetchAttendance({ company: 'digiayudh', date: selectedDate }))
  }, [dispatch, selectedDate])

  const handleMarkAttendance = async () => {
    if (!selectedEmployee) {
      toast.error('Select an employee')
      return
    }

    try {
      await dispatch(markAttendance({
        employeeId: selectedEmployee._id,
        date: selectedDate,
        status,
        checkInTime: status === 'present' ? checkInTime : undefined,
        checkOutTime: status === 'present' ? checkOutTime : undefined,
      })).unwrap()
      toast.success('Attendance marked')
      setMarkDialogOpen(false)
      setSelectedEmployee(null)
      setCheckInTime('')
      setCheckOutTime('')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to mark attendance')
    }
  }

  const todayAttendance = attendance.filter((a) => a.date === selectedDate)
  const absentToday = employees.filter(
    (e) => !todayAttendance.find((a) => a.employeeId === e._id)
  )

  const stats = {
    present: todayAttendance.filter((a) => a.status === 'present').length,
    absent: todayAttendance.filter((a) => a.status === 'absent').length,
    onLeave: todayAttendance.filter((a) => a.status === 'leave').length,
  }

  const columns: Column<Attendance>[] = [
    { header: 'Employee', accessor: 'employeeName', sortable: true },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'present' ? 'success' : row.status === 'leave' ? 'outline' : 'destructive'}>
          {row.status === 'present' ? '✓ Present' : row.status === 'leave' ? 'On Leave' : '✗ Absent'}
        </Badge>
      ),
    },
    {
      header: 'Check In',
      accessor: 'checkInTime',
      cell: (row) => row.checkInTime || '-',
    },
    {
      header: 'Check Out',
      accessor: 'checkOutTime',
      cell: (row) => row.checkOutTime || '-',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Management" subtitle="Track employee attendance and manage schedules.">
        <Button onClick={() => setMarkDialogOpen(true)}><Plus className="h-4 w-4" /> Mark Attendance</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.present}</span>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.absent}</span>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.onLeave}</span>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Marked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{absentToday.length}</span>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daily Attendance - {selectedDate}</CardTitle>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={todayAttendance}
            loading={loading}
            searchPlaceholder="Search by employee..."
            searchKeys={['employeeName']}
            exportFileName="attendance"
          />
        </CardContent>
      </Card>

      <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
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

            <FormField label="Status">
              <Select value={status} onValueChange={(s) => setStatus(s as 'present' | 'absent')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {status === 'present' && (
              <>
                <FormField label="Check In Time">
                  <Input 
                    type="time" 
                    value={checkInTime} 
                    onChange={(e) => setCheckInTime(e.target.value)} 
                    placeholder="09:00"
                  />
                </FormField>
                <FormField label="Check Out Time">
                  <Input 
                    type="time" 
                    value={checkOutTime} 
                    onChange={(e) => setCheckOutTime(e.target.value)} 
                    placeholder="18:00"
                  />
                </FormField>
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setMarkDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleMarkAttendance}>Mark Attendance</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
