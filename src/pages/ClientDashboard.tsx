import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Eye, FileText, Download, ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchProjects } from '../redux/slices/projectsSlice'
import { fetchDocuments } from '../redux/slices/businessSlice'
import { formatDate, formatFileSize } from '../lib/utils'

export default function ClientDashboard() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { projects } = useAppSelector((state) => state.projects)
  const { documents } = useAppSelector((state) => state.business)

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchProjects(user.company))
    }
    dispatch(fetchDocuments())
  }, [user, dispatch])

  const clientProjects = projects.filter((p) => p.clientId === user?._id)

  // Get documents for client's projects
  const clientDocuments = documents.filter((doc) => {
    const clientProjectIds = projects
      .filter((p) => p.clientId === user?._id)
      .map((p) => p._id)
    return clientProjectIds.includes(doc.projectId || '')
  }).slice(0, 3)

  return (
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
              <FolderKanban size={24} />
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

      {/* Documents Section */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Recent Documents
          </h2>
          <Link to="/client/documents" className="flex items-center gap-1 text-sm text-primary hover:underline">
            All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-4">
          {clientDocuments.length > 0 ? (
            clientDocuments.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
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
        </div>
      </div>
    </div>
  )
}