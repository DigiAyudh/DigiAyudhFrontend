import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, ListTodo, CheckCircle2, UserCheck, ArrowRight, LogIn, LogOut, Clock, FileText, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchDashboardStats } from '../../redux/slices/dashboardSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchDocuments } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { ChartCard } from '../../components/common/ChartCard'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { projectProgress, formatDate, formatFileSize } from '../../lib/utils'
import apiClient from '../../services/api'

const STAT_ICONS = [FolderKanban, ListTodo, CheckCircle2, UserCheck]
const taskData = [
  { day: 'Mon', done: 5, added: 3 },
  { day: 'Tue', done: 7, added: 4 },
  { day: 'Wed', done: 4, added: 6 },
  { day: 'Thu', done: 8, added: 2 },
  { day: 'Fri', done: 6, added: 5 },
]

export default function EmployeeDashboard() {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((s) => s.dashboard)
  const { projects } = useAppSelector((s) => s.projects)
  const { documents } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false)

  useEffect(() => {
    dispatch(fetchDashboardStats('employee'))
    dispatch(fetchProjects())
    dispatch(fetchDocuments())
    fetchTodayAttendance()
  }, [dispatch])

  const fetchTodayAttendance = async () => {
    try {
      const response = await apiClient.getAttendance('digiayudh', new Date().toISOString().split('T')[0])
      const today = response.data.data?.find((a: any) => a.employeeId === user?._id)
      setTodayAttendance(today)
    } catch (error) {
      console.log('[v0] Attendance fetch error (expected on first load)')
    }
  }

  const handleCheckIn = async () => {
    setIsSubmittingAttendance(true)
    try {
      await apiClient.markAttendance({
        employeeId: user?._id,
        employeeName: user?.name,
        date: new Date().toISOString().split('T')[0],
        checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'present',
      })
      toast.success('Checked in successfully')
      fetchTodayAttendance()
    } catch (error) {
      toast.error('Failed to check in')
    } finally {
      setIsSubmittingAttendance(false)
    }
  }

  const handleCheckOut = async () => {
    setIsSubmittingAttendance(true)
    try {
      await apiClient.markAttendance({
        employeeId: user?._id,
        employeeName: user?.name,
        date: new Date().toISOString().split('T')[0],
        checkInTime: todayAttendance?.checkInTime,
        checkOutTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'present',
      })
      toast.success('Checked out successfully')
      fetchTodayAttendance()
    } catch (error) {
      toast.error('Failed to check out')
    } finally {
      setIsSubmittingAttendance(false)
    }
  }

  // Get documents for employee's assigned projects
  const employeeDocuments = documents.filter((doc) => {
    const assignedProjectIds = projects
      .filter((p) => (p.teamMembers || []).includes(user?._id || ''))
      .map((p) => p._id)
    return assignedProjectIds.includes(doc.projectId || '')
  }).slice(0, 3)

  return (
    <div>
      <PageHeader title={`Hello, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Here's your workload for today." />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} icon={STAT_ICONS[i % STAT_ICONS.length]} index={i} />
            ))}
      </div>

      {/* Attendance Card */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayAttendance ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                <div>
                  <p className="text-xs text-text-light">Check-In</p>
                  <p className="flex items-center gap-2 text-lg font-semibold">
                    <LogIn className="h-4 w-4 text-green-600" />
                    {todayAttendance.checkInTime || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-light">Check-Out</p>
                  <p className="flex items-center gap-2 text-lg font-semibold">
                    <LogOut className="h-4 w-4 text-red-600" />
                    {todayAttendance.checkOutTime || '—'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-light">You have already checked in today. Attendance records cannot be edited.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-light">No attendance marked for today yet.</p>
              <Button onClick={handleCheckIn} disabled={isSubmittingAttendance} className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                {isSubmittingAttendance ? 'Checking In...' : 'Check In'}
              </Button>
            </div>
          )}
          {todayAttendance && !todayAttendance.checkOutTime && (
            <Button onClick={handleCheckOut} disabled={isSubmittingAttendance} variant="outline" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              {isSubmittingAttendance ? 'Checking Out...' : 'Check Out'}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Task Activity" subtitle="Completed vs added this week" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taskData} margin={{ left: -10, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--text))' }}
              />
              <Bar dataKey="done" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="added" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My Projects</CardTitle>
            <Link to="/employee/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 4).map((p) => (
              <div key={p._id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <Progress value={projectProgress(p.status)} />
              </div>
            ))}
            {projects.length === 0 && <p className="py-4 text-center text-sm text-text-light">No projects assigned</p>}
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Recent Documents</CardTitle>
          <Link to="/employee/documents" className="flex items-center gap-1 text-sm text-primary hover:underline">
            All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {employeeDocuments.length > 0 ? (
            employeeDocuments.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-48">{doc.name}</p>
                    <p className="text-xs text-text-light">{formatFileSize(doc.size)} - {formatDate(doc.createdAt)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => window.open(doc.url, '_blank')} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-text-light">No documents available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}