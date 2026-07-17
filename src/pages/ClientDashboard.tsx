import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchProjects } from '../redux/slices/projectsSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Briefcase, Eye } from 'lucide-react'

export default function ClientDashboard() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { projects } = useAppSelector((state) => state.projects)

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchProjects(user.company))
    }
  }, [user, dispatch])

  const clientProjects = projects.filter((p) => p.clientId === user?._id)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text">Client Dashboard</h1>
          <p className="text-text-light mt-2">Track your projects and collaborate with our team</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-light text-sm font-medium">Active Projects</p>
                <p className="text-3xl font-bold text-text mt-2">
                  {clientProjects.filter((p) => p.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <Briefcase size={24} />
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-light text-sm font-medium">Total Projects</p>
                <p className="text-3xl font-bold text-text mt-2">{clientProjects.length}</p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Eye size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-text mb-6">Your Projects</h2>
          <div className="space-y-4">
            {clientProjects.length > 0 ? (
              clientProjects.map((project) => (
                <div key={project._id} className="p-4 border border-border rounded-lg hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-text">{project.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-text-light mb-3">{project.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-text-light">Start Date</p>
                      <p className="text-text font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-text-light">End Date</p>
                      <p className="text-text font-medium">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-light">Priority</p>
                      <p className="text-text font-medium capitalize">{project.priority}</p>
                    </div>
                    <div>
                      <p className="text-text-light">Team Size</p>
                      <p className="text-text font-medium">{project.teamMembers.length} members</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-light text-center py-8">No projects assigned yet</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
