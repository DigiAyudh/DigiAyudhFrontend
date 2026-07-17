import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchProjects } from '../redux/slices/projectsSlice'
import { fetchEmployees } from '../redux/slices/employeesSlice'
import { fetchLeads } from '../redux/slices/leadsSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Users, Briefcase, TrendingUp, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { projects } = useAppSelector((state) => state.projects)
  const { employees } = useAppSelector((state) => state.employees)
  const { leads } = useAppSelector((state) => state.leads)

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchProjects(user.company))
      dispatch(fetchEmployees(user.company))
      dispatch(fetchLeads(user.company))
    }
  }, [user, dispatch])

  const stats = [
    {
      label: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Projects',
      value: projects.filter((p) => p.status === 'active').length,
      icon: Briefcase,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Leads',
      value: leads.length,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Pending Tasks',
      value: '12',
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-text-light mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={i}
                className="bg-background border border-border rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-light text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-text mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Projects */}
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-text mb-6">Recent Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-light font-medium">Project Name</th>
                  <th className="text-left py-3 px-4 text-text-light font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-text-light font-medium">Progress</th>
                  <th className="text-left py-3 px-4 text-text-light font-medium">Team Size</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((project) => (
                  <tr key={project._id} className="border-b border-border hover:bg-surface">
                    <td className="py-3 px-4 text-text font-medium">{project.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${'bg-green-100 text-green-700'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-surface rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text">{project.teamMembers.length} members</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
