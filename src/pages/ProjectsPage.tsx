import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchProjects, createProject } from '../redux/slices/projectsSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'

export default function ProjectsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { projects, loading } = useAppSelector((state) => state.projects)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    startDate: '',
    priority: 'medium',
  })

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchProjects(user.company))
    }
  }, [user, dispatch])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.company) {
      await dispatch(
        createProject({
          ...formData,
          company: user.company,
          managerId: user._id,
          budget: parseFloat(formData.budget),
        })
      )
      setFormData({ title: '', description: '', budget: '', startDate: '', priority: 'medium' })
      setShowForm(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-text">Projects</h1>
            <p className="text-text-light mt-2">Manage all your projects here</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Project Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project title"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Budget</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Enter budget"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-border text-text rounded-lg hover:bg-surface transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-background border border-border rounded-xl p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-text flex-1">{project.title}</h3>
                <div className="flex gap-2">
                  <button className="p-2 text-text-light hover:text-primary transition">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-text-light hover:text-red-500 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="text-text-light text-sm mb-4">{project.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-light">Status:</span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-light">Priority:</span>
                  <span className={`px-3 py-1 rounded-full font-medium ${
                    project.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-light">Team:</span>
                  <span className="text-text font-medium">{project.teamMembers.length} members</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-light">
                  <Calendar size={16} />
                  {new Date(project.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-light text-lg">No projects yet. Create your first project to get started!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
