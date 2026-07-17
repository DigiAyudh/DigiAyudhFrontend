import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, FolderKanban, DollarSign, ArrowRight, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchDashboardStats } from '../../redux/slices/dashboardSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchContactRequests } from '../../redux/slices/contactSlice'
import { fetchClients } from '../../redux/slices/clientsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { ChartCard } from '../../components/common/ChartCard'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Skeleton } from '../../components/ui/skeleton'
import { formatRelativeTime } from '../../utils/helpers'

const STAT_ICONS = [Users, UserCheck, FolderKanban, DollarSign]

const revenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 48000 },
  { month: 'Mar', revenue: 45000 },
  { month: 'Apr', revenue: 58000 },
  { month: 'May', revenue: 63000 },
  { month: 'Jun', revenue: 71000 },
]

const PIE_COLORS = ['hsl(var(--primary))', '#4ECDC4', '#FFB84D', '#94A3B8']

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((s) => s.dashboard)
  const { projects } = useAppSelector((s) => s.projects)
  const { requests } = useAppSelector((s) => s.contact)
  const { clients } = useAppSelector((s) => s.clients)

  useEffect(() => {
    dispatch(fetchDashboardStats('admin'))
    dispatch(fetchProjects())
    dispatch(fetchContactRequests())
    dispatch(fetchClients())
  }, [dispatch])

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const pendingClients = clients.filter((c) => c.verificationStatus === 'pending')
  const newRequests = requests.filter((r) => r.status === 'new')

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" subtitle="Company-wide performance and activity at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} icon={STAT_ICONS[i % STAT_ICONS.length]} index={i} />
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue Trend" subtitle="Last 6 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ left: -8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--text))' }}
                formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Projects by Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} innerRadius={48} paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--text))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pending Client Verifications</CardTitle>
            <Link to="/admin/verification" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Review <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingClients.slice(0, 5).map((c) => (
              <div key={c._id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-text-light">{c.companyName || c.email}</p>
                </div>
                <StatusBadge status="pending" />
              </div>
            ))}
            {pendingClients.length === 0 && <p className="py-4 text-center text-sm text-text-light">No pending verifications</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>New Contact Requests</CardTitle>
            <Link to="/admin/contact-requests" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {newRequests.slice(0, 5).map((r) => (
              <div key={r._id} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.subject}</p>
                  <p className="truncate text-xs text-text-light">{r.name} · {formatRelativeTime(r.createdAt)}</p>
                </div>
              </div>
            ))}
            {newRequests.length === 0 && <p className="py-4 text-center text-sm text-text-light">No new requests</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
