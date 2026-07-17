import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchProjects } from '../redux/slices/projectsSlice'
import { fetchEmployees } from '../redux/slices/employeesSlice'
import { fetchTasks } from '../redux/slices/tasksSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Download, TrendingUp, Users, CheckSquare, Briefcase } from 'lucide-react'

export default function ReportsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { projects } = useAppSelector((state) => state.projects)
  const { employees } = useAppSelector((state) => state.employees)
  const { tasks } = useAppSelector((state) => state.tasks)
  const [reportType, setReportType] = useState('overview')

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchProjects(user.company))
      dispatch(fetchEmployees(user.company))
      dispatch(fetchTasks({ company: user.company }))
    }
  }, [user, dispatch])

  const metrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    totalEmployees: employees.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    averageProjectBudget: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / projects.length) : 0,
  }

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      metrics,
      projects,
      employees,
      tasks,
    }
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)))
    element.setAttribute('download', `report-${Date.now()}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-text">Reports</h1>
            <p className="text-text-light mt-2">Analyze your business metrics</p>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Report Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {['overview', 'projects', 'employees', 'tasks'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                reportType === type
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-light hover:bg-surface-dark'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Overview Report */}
        {reportType === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-light text-sm font-medium">Total Projects</p>
                    <p className="text-3xl font-bold text-text mt-2">{metrics.totalProjects}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                    <Briefcase size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-light text-sm font-medium">Active Projects</p>
                    <p className="text-3xl font-bold text-text mt-2">{metrics.activeProjects}</p>
                  </div>
                  <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-light text-sm font-medium">Total Employees</p>
                    <p className="text-3xl font-bold text-text mt-2">{metrics.totalEmployees}</p>
                  </div>
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-light text-sm font-medium">Completed Tasks</p>
                    <p className="text-3xl font-bold text-text mt-2">{metrics.completedTasks}</p>
                  </div>
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                    <CheckSquare size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-text mb-4">Project Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-light">Completed</span>
                    <span className="text-xl font-bold text-text">{metrics.completedProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-light">In Progress</span>
                    <span className="text-xl font-bold text-text">{metrics.activeProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-light">Avg Budget</span>
                    <span className="text-xl font-bold text-text">${metrics.averageProjectBudget}</span>
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-text mb-4">Task Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-light">Total Tasks</span>
                    <span className="text-xl font-bold text-text">{metrics.totalTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-light">Completed</span>
                    <span className="text-xl font-bold text-text">{metrics.completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-light">Completion Rate</span>
                    <span className="text-xl font-bold text-text">
                      {metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Report */}
        {reportType === 'projects' && (
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text mb-6">Project Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-light font-medium">Project</th>
                    <th className="text-left py-3 px-4 text-text-light font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-text-light font-medium">Budget</th>
                    <th className="text-left py-3 px-4 text-text-light font-medium">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id} className="border-b border-border hover:bg-surface">
                      <td className="py-3 px-4 text-text font-medium">{project.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text">${project.budget || 0}</td>
                      <td className="py-3 px-4 text-text">{project.teamMembers.length} members</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
