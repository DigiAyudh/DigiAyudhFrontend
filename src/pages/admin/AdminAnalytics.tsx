import { useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchClients } from '../../redux/slices/clientsSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { ChartCard } from '../../components/common/ChartCard'

const tooltipStyle = { background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--text))' }
const growth = [
  { month: 'Jan', clients: 18, projects: 12 },
  { month: 'Feb', clients: 22, projects: 15 },
  { month: 'Mar', clients: 27, projects: 19 },
  { month: 'Apr', clients: 31, projects: 22 },
  { month: 'May', clients: 38, projects: 28 },
  { month: 'Jun', clients: 45, projects: 33 },
]
const revenueByService = [
  { name: 'Consulting', value: 42 },
  { name: 'Development', value: 88 },
  { name: 'Support', value: 31 },
  { name: 'Design', value: 27 },
]
const acquisition = [
  { source: 'Referral', value: 34 },
  { source: 'Website', value: 51 },
  { source: 'Social', value: 22 },
  { source: 'Direct', value: 18 },
]
const PIE = ['hsl(var(--primary))', '#4ECDC4', '#FFA94D', '#748FFC']

export default function AdminAnalytics() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchClients())
    dispatch(fetchProjects())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Growth, revenue and acquisition insights." />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Growth Trend" subtitle="Clients and projects over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growth} margin={{ left: -10, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(v) => <span className="text-xs capitalize text-text-light">{v}</span>} />
              <Line type="monotone" dataKey="clients" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="projects" stroke="#4ECDC4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Service" subtitle="In thousands (USD)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByService} margin={{ left: -10, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Client Acquisition" subtitle="By channel">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={acquisition} dataKey="value" nameKey="source" innerRadius={60} outerRadius={100} paddingAngle={3}>
                {acquisition.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Legend iconType="circle" formatter={(v) => <span className="text-xs text-text-light">{v}</span>} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Projects Completed" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growth} margin={{ left: -10, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--text-light))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={tooltipStyle} />
              <Bar dataKey="projects" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
