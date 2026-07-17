import { useEffect, useState } from 'react'
import { ListChecks, Plus, Edit2, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchTasks } from '../../redux/slices/tasksSlice'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { formatDate, getInitials } from '../../lib/utils'
import type { Task, User } from '../../types'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  assignedTo: z.string().min(1, 'Please assign to an employee'),
  dueDate: z.string().min(1, 'Due date is required'),
  estimatedHours: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

export default function AdminTasksPage() {
  const dispatch = useAppDispatch()
  const { tasks, loading } = useAppSelector((s) => s.tasks)
  const { user } = useAppSelector((s) => s.auth)
  const [employees, setEmployees] = useState<User[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'todo',
      priority: 'medium',
    },
  })

  useEffect(() => {
    dispatch(fetchTasks())
    const loadEmployees = async () => {
      try {
        const res = await apiClient.getEmployeeAccounts()
        setEmployees(res.data.data as User[])
      } catch (error) {
        console.error('Failed to load employees')
      }
    }
    loadEmployees()
  }, [dispatch])

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true)
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo,
        dueDate: new Date(data.dueDate),
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
        projectId: 'p_default',
        createdBy: user?._id,
        company: 'digiayudh',
      }

      if (editingId) {
        await apiClient.updateTask(editingId, taskData)
        toast.success('Task updated successfully')
      } else {
        await apiClient.createTask(taskData)
        toast.success('Task created successfully')
      }

      dispatch(fetchTasks())
      setIsOpen(false)
      setEditingId(null)
      reset()
    } catch (error) {
      toast.error('Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingId(task._id)
    reset({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate?.toString().split('T')[0],
      estimatedHours: task.estimatedHours?.toString(),
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await apiClient.deleteTask(id)
      toast.success('Task deleted successfully')
      dispatch(fetchTasks())
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const getAssigneeInfo = (employeeId: string) => {
    const employee = employees.find((e) => e._id === employeeId)
    return {
      name: employee?.name || 'Unassigned',
      email: employee?.email || '',
    }
  }

  const columns: Column<Task>[] = [
    {
      header: 'Task',
      accessor: 'title',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo',
      cell: (row) => {
        const assignee = getAssigneeInfo(row.assignedTo)
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{getInitials(assignee.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{assignee.name}</p>
              <p className="text-xs text-muted-foreground">{assignee.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            row.priority === 'high'
              ? 'bg-destructive/10 text-destructive'
              : row.priority === 'medium'
                ? 'bg-yellow-100/50 text-yellow-700'
                : 'bg-green-100/50 text-green-700'
          }`}
        >
          {row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
        </span>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      cell: (row) => formatDate(row.dueDate),
    },
    {
      header: 'Est. Hours',
      accessor: 'estimatedHours',
      cell: (row) => row.estimatedHours ? `${row.estimatedHours}h` : '—',
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 hover:bg-muted rounded transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Tasks" subtitle="Assign and manage team tasks." />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                reset()
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Task' : 'Create New Task'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update task details' : 'Create a new task and assign it to an employee'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Fix login bug"
                  {...register('title')}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed task description"
                  rows={3}
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To Employee *</Label>
                  <select
                    {...register('assignedTo')}
                    className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Select an employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                  {errors.assignedTo && <p className="text-xs text-destructive">{errors.assignedTo.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    {...register('status')}
                    className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    {...register('priority')}
                    className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register('dueDate')}
                  />
                  {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Est. Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    placeholder="8"
                    step="0.5"
                    {...register('estimatedHours')}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    setEditingId(null)
                    reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={tasks}
        loading={loading}
        searchPlaceholder="Search tasks..."
        searchKeys={['title', 'description']}
        exportFileName="tasks"
      />
    </div>
  )
}
