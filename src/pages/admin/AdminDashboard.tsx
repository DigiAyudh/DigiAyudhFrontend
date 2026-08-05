import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, FolderKanban, DollarSign, ArrowRight, Clock, FileText, Download, LifeBuoy } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchDashboardStats } from '../../redux/slices/dashboardSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchContactRequests } from '../../redux/slices/contactSlice'
import { fetchClients } from '../../redux/slices/clientsSlice'
import { fetchDocuments } from '../../redux/slices/businessSlice'
import { fetchTickets } from '../../redux/slices/supportSlice'
import { fetchSportTickets } from '../../redux/slices/sportSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { ChartCard } from '../../components/common/ChartCard'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Skeleton } from '../../components/ui/skeleton'
import { formatRelativeTime } from '../../utils/helpers'
import { formatFileSize, formatDate } from '../../lib/utils'

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
  const { documents } = useAppSelector((s) => s.business)
  const { tickets } = useAppSelector((s) => s.support)
  const { tickets: sportTickets } = useAppSelector((s) => s.sport)

  useEffect(() => {
    dispatch(fetchDashboardStats('admin'))
    dispatch(fetchProjects())
    dispatch(fetchContactRequests())
    dispatch(fetchClients())
    dispatch(fetchDocuments())
    dispatch(fetchTickets())
    dispatch(fetchSportTickets())
  }, [dispatch])

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const pendingClients = clients.filter((c) => c.verificationStatus === 'pending')
  const newRequests = requests.filter((r) => r.status === 'new')
  const recentDocuments = documents.slice(0, 3)
  const recentTickets = [...tickets, ...sportTickets]
    .filter((t) => !t || typeof t !== 'object' || t._id)
    .slice(0, 5)

  return (
    <div>
      <PageHeader title="Admin Overview" subtitle="Company-wide performance and activity at a glance." />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} icon={STAT_ICONS[i % STAT_ICONS.length]} index={i} />
            ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
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
              <YAxis stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => "$" + (v as number / 1000) + "k"} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--text))' }}
                formatter={(v) => ["$" + Number(v ?? 0).toLocaleString(), 'Revenue']}
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

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pending Client Verifications</CardTitle>
            <Link to="/admin/verification" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Review <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {pendingClients.slice(0, 5).map((c, idx) => (
              <div key={c._id} className={`flex items-center justify-between gap-2 ${idx > 0 ? 'mt-3' : ''}`}>
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
          <CardContent>
            {newRequests.slice(0, 5).map((r, idx) => (
              <div key={r._id} className={`flex items-start gap-3 ${idx > 0 ? 'mt-3' : ''}`}>
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

      {/* Recent Support Tickets Section */}
      <Card className="mt-5">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5" />Recent Support Tickets</CardTitle>
          <Link to="/admin/sport-tickets" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentTickets.length > 0 ? (
            recentTickets.map((t: any, idx: number) => (
              <div key={t._id || idx} className={`flex items-center justify-between ${idx > 0 ? 'mt-4' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.subject}</p>
                  <p className="truncate text-xs text-text-light">
                    {t.createdByName || t.clientName || 'Client'} · {t.projectName || t.category || 'General'} · {formatRelativeTime(t.createdAt)}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <StatusBadge status={t.priority || t.status} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-text-light">No support tickets yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Documents Section */}
      <Card className="mt-5">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Recent Documents</CardTitle>
          <Link to="/admin/documents" className="flex items-center gap-1 text-sm text-primary hover:underline">
            All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentDocuments.length > 0 ? (
            recentDocuments.map((doc, idx) => (
              <div key={doc._id} className={`flex items-center justify-between ${idx > 0 ? 'mt-4' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-48">{doc.name}</p>
                    <p className="text-xs text-text-light">{formatFileSize(doc.size)} - {formatDate(doc.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(doc.url, '_blank')}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
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