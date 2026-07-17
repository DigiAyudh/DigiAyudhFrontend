import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchTasks, createTask } from '../redux/slices/tasksSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Plus, Clock, CheckCircle } from 'lucide-react'

export default function TasksPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { tasks, loading } = useAppSelector((state) => state.tasks)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
  })

  useEffect(() => {
    if (user?.company) {
      dispatch(fetchTasks({ company: user.company }))
    }
  }, [user, dispatch])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.company) {
      await dispatch(
        createTask({
          ...formData,
          company: user.company,
          createdBy: user._id,
          projectId: '', // Should be selected from projects
        })
      )
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium', status: 'todo' })
      setShowForm(false)
    }
  }

  const filteredTasks = statusFilter === 'all' ? tasks : tasks.filter((t) => t.status === statusFilter)

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle size={18} className="text-green-500" />
    if (status === 'in-progress') return <Clock size={18} className="text-blue-500" />
    return <Clock size={18} className="text-gray-500" />
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-text">Tasks</h1>
            <p className="text-text-light mt-2">Organize and track your work</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'todo', 'in-progress', 'review', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-light hover:bg-surface-dark'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text mb-6">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Create Task
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

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-background border border-border rounded-xl p-4 hover:shadow-lg transition flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <h3 className="font-bold text-text">{task.title}</h3>
                  </div>
                  <p className="text-text-light text-sm mt-2">{task.description}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-text-light py-8">No tasks found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
