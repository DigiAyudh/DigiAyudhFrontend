import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchTasks } from '../../redux/slices/tasksSlice'
import { fetchToDos, createToDo, updateToDo, deleteToDo } from '../../redux/slices/todoSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { formatDate } from '../../lib/utils'
import { StatusBadge } from '../../components/common/StatusBadge'

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
})

type ToDoFormData = z.infer<typeof todoSchema>

export default function MyTasksPage() {
  const dispatch = useAppDispatch()
  const { tasks, loading } = useAppSelector((s) => s.tasks)
  const { todos } = useAppSelector((s) => s.todos)
  const { user } = useAppSelector((s) => s.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ToDoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: { priority: 'medium' },
  })

  useEffect(() => {
    dispatch(fetchTasks(undefined))
    if (user?._id) {
      dispatch(fetchToDos(user._id))
    }
  }, [dispatch, user?._id])

  const onSubmit = async (data: ToDoFormData) => {
    if (!selectedTaskId || !user?._id) {
      toast.error('Please select a task')
      return
    }

    try {
      const todoData = {
        taskId: selectedTaskId,
        employeeId: user._id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completed: false,
      }

      if (editingTodo) {
        await dispatch(updateToDo({ id: editingTodo, data: todoData })).unwrap()
        toast.success('To-Do updated successfully')
      } else {
        await dispatch(createToDo(todoData)).unwrap()
        toast.success('To-Do created successfully')
      }

      setIsOpen(false)
      setEditingTodo(null)
      reset()
    } catch (error) {
      toast.error('Failed to save to-do')
    }
  }

  const handleDeleteToDo = async (id: string) => {
    if (!window.confirm('Delete this to-do?')) return
    try {
      await dispatch(deleteToDo(id)).unwrap()
      toast.success('To-Do deleted')
    } catch (error) {
      toast.error('Failed to delete to-do')
    }
  }

  const handleToggleToDo = async (todo: any) => {
    try {
      await dispatch(updateToDo({ id: todo._id, data: { completed: !todo.completed } })).unwrap()
      toast.success(todo.completed ? 'To-Do unmarked' : 'To-Do completed!')
    } catch (error) {
      toast.error('Failed to update to-do')
    }
  }

  const handleEditToDo = (todo: any, taskId: string) => {
    setEditingTodo(todo._id)
    setSelectedTaskId(taskId)
    reset({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
    })
    setIsOpen(true)
  }

  const myTasks = tasks.filter((t) => t.assignedTo === user?._id)
  const myTodos = todos.filter((t) => t.employeeId === user?._id)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const completedCount = myTodos.filter((t) => t.completed).length
  const totalCount = myTodos.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        subtitle="View and manage your assigned tasks and to-do list"
      />

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Assigned Tasks ({myTasks.length})</TabsTrigger>
          <TabsTrigger value="todos">
            To-Do List ({completedCount}/{totalCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {myTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-text-light">
                No tasks assigned to you yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myTasks.map((task) => (
                <Card key={task._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <p className="mt-1 text-sm text-text-light">{task.description}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{task.priority}</Badge>
                      {task.dueDate && (
                        <Badge variant="outline">
                          Due {formatDate(task.dueDate)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTaskId(task._id)
                        setEditingTodo(null)
                        reset({ title: '', description: '', priority: 'medium', dueDate: '' })
                        setIsOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add To-Do
                    </Button>

                    {/* Task's To-Dos */}
                    {myTodos.filter((t) => t.taskId === task._id).length > 0 && (
                      <div className="mt-4 space-y-2 border-t pt-3">
                        <p className="text-xs font-medium text-text-light">To-Dos for this task:</p>
                        {myTodos
                          .filter((t) => t.taskId === task._id)
                          .map((todo) => (
                            <div
                              key={todo._id}
                              className="flex items-start gap-3 rounded-lg bg-muted p-2"
                            >
                              <button
                                onClick={() => handleToggleToDo(todo)}
                                className="mt-1 flex-shrink-0 text-primary hover:text-primary-dark"
                              >
                                {todo.completed ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm ${
                                    todo.completed
                                      ? 'line-through text-text-light'
                                      : 'text-text'
                                  }`}
                                >
                                  {todo.title}
                                </p>
                                {todo.description && (
                                  <p className="text-xs text-text-light">{todo.description}</p>
                                )}
                                <div className="mt-1 flex gap-2">
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(todo.priority)}`}>
                                    {todo.priority}
                                  </Badge>
                                  {todo.dueDate && (
                                    <span className="text-xs text-text-light">
                                      Due {formatDate(todo.dueDate)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditToDo(todo, task._id)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDeleteToDo(todo._id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-light">
              {completedCount} of {totalCount} completed
            </div>
            <Dialog open={isOpen} onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) {
                setEditingTodo(null)
                reset()
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedTaskId(myTasks[0]?._id || null)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New To-Do
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTodo ? 'Edit To-Do' : 'Create To-Do'}</DialogTitle>
                  <DialogDescription>
                    {editingTodo ? 'Update your to-do item' : 'Add a new item to your to-do list'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input {...register('title')} placeholder="Enter to-do title" />
                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea {...register('description')} placeholder="Optional description" rows={3} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select {...register('priority')} className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input type="date" {...register('dueDate')} />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save To-Do'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {myTodos.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-text-light">
                No to-dos yet. Create one to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {myTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="flex items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/50"
                >
                  <button
                    onClick={() => handleToggleToDo(todo)}
                    className="mt-1 flex-shrink-0 text-primary hover:text-primary-dark"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        todo.completed ? 'line-through text-text-light' : 'text-text'
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="mt-1 text-sm text-text-light">{todo.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                        {todo.priority}
                      </Badge>
                      {todo.dueDate && (
                        <Badge variant="outline">Due {formatDate(todo.dueDate)}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditToDo(todo, todo.taskId)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDeleteToDo(todo._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
