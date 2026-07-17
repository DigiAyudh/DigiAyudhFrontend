import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, LifeBuoy, DollarSign, FileText, ArrowRight, Calendar } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchDashboardStats } from '../../redux/slices/dashboardSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchInvoices, fetchMeetings } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { formatCurrency, formatDate, projectProgress } from '../../lib/utils'

const STAT_ICONS = [FolderKanban, LifeBuoy, DollarSign, FileText]

export default function ClientDashboard() {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((s) => s.dashboard)
  const { projects } = useAppSelector((s) => s.projects)
  const { invoices, meetings } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)

  useEffect(() => {
    dispatch(fetchDashboardStats('client'))
    dispatch(fetchProjects())
    dispatch(fetchInvoices())
    dispatch(fetchMeetings())
  }, [dispatch])

  const upcoming = [...meetings]
    .filter((m) => new Date(m.start).getTime() > Date.now() - 86400000)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Track your projects, invoices and meetings." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} icon={STAT_ICONS[i % STAT_ICONS.length]} index={i} />
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My Projects</CardTitle>
            <Link to="/client/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 5).map((p) => (
              <Link key={p._id} to={`/client/projects/${p._id}`} className="block space-y-1.5 rounded-lg p-2 hover:bg-muted">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <Progress value={projectProgress(p.status)} />
              </Link>
            ))}
            {projects.length === 0 && <p className="py-4 text-center text-sm text-text-light">No active projects</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Upcoming Meetings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {upcoming.map((m) => (
                <div key={m._id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-text-light">{formatDate(m.start)}</p>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && <p className="py-2 text-center text-sm text-text-light">No meetings scheduled</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {invoices.slice(0, 3).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{inv.number}</p>
                    <p className="text-xs text-text-light">{formatCurrency(inv.total)}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
              ))}
              {invoices.length === 0 && <p className="py-2 text-center text-sm text-text-light">No invoices</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
