import { useEffect } from 'react'
import { CalendarCheck, Clock, TrendingUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchAttendance } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable } from '../../components/common/DataTable'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { formatDate } from '../../lib/utils'
import type { Attendance } from '../../types'

export default function AttendancePage() {
  const dispatch = useAppDispatch()
  const { attendance, loading } = useAppSelector((s) => s.business)

  useEffect(() => {
    dispatch(fetchAttendance())
  }, [dispatch])

  const present = attendance.filter((a) => a.status === 'present' || a.status === 'remote').length
  const late = attendance.filter((a) => a.status === 'late').length
  const rate = attendance.length ? Math.round((present / attendance.length) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle="Your attendance history and stats." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard stat={{ label: 'Present Days', value: present, change: 0, trend: 'up' }} icon={CalendarCheck} index={0} />
        <StatCard stat={{ label: 'Late Arrivals', value: late, change: 0, trend: 'down' }} icon={Clock} index={1} />
        <StatCard stat={{ label: 'Attendance Rate', value: rate, change: 0, trend: 'up', format: 'percent' }} icon={TrendingUp} index={2} />
      </div>

      <DataTable<Attendance>
        data={attendance}
        loading={loading}
        searchKeys={['employeeName', 'status']}
        searchPlaceholder="Search records..."
        exportFileName="attendance"
        columns={[
          { header: 'Date', accessor: 'date', sortable: true, cell: (r) => formatDate(r.date) },
          { header: 'Check In', accessor: 'checkIn', cell: (r) => r.checkIn || '—' },
          { header: 'Check Out', accessor: 'checkOut', cell: (r) => r.checkOut || '—' },
          { header: 'Hours', accessor: 'hours', sortable: true, cell: (r) => (r.hours != null ? `${r.hours}h` : '—') },
          { header: 'Status', accessor: 'status', cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  )
}
