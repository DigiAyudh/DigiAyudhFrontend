import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchTasks } from '../redux/slices/tasksSlice'
import { fetchProjects } from '../redux/slices/projectsSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function EmployeeDashboard() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { tasks } = useAppSelector((state) => state.tasks)
  const { projects } = useAppSelector((state) => state.projects)

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchTasks({ company: user.company }))
      dispatch(fetchProjects(user.company))
    }
  }, [user, dispatch])

  const myTasks = tasks.filter((t) => t.assignedTo === user?._id)
  const completedTasks = myTasks.filter((t) => t.status === 'completed')
  const pendingTasks = myTasks.filter((t) => t.status !== 'completed')

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text">Employee Dashboard</h1>
          <p className="text-text-light mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-light text-sm font-medium">My Tasks</p>
                <p className="text-3xl font-bold text-text mt-2">{myTasks.length}</p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-light text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-text mt-2">{pendingTasks.length}</p>
              </div>
              <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-light text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-text mt-2">{completedTasks.length}</p>
              </div>
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* My Projects */}
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-text mb-6">My Projects</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.slice(0, 4).map((project) => (
              <div key={project._id} className="p-4 border border-border rounded-lg hover:shadow-lg transition">
                <h3 className="font-bold text-text">{project.title}</h3>
                <p className="text-text-light text-sm mt-1">{project.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700`}>
                    {project.status}
                  </span>
                  <span className="text-text-light text-sm">{project.teamMembers.length} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-text mb-6">My Tasks</h2>
          <div className="space-y-3">
            {myTasks.slice(0, 8).map((task) => (
              <div key={task._id} className="p-4 border border-border rounded-lg hover:bg-surface">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-text">{task.title}</h4>
                    <p className="text-text-light text-sm mt-1">{task.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
