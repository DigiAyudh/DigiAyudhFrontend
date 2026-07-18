import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Plus, Edit2, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchClients } from '../../redux/slices/clientsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { projectProgress, formatDate, formatCurrency } from '../../lib/utils'
import apiClient from '../../services/api'
import type { Project } from '../../types'

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['planning', 'active', 'completed', 'on-hold']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  clientId: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface Props {
  basePath: string
}

export default function ProjectsPage({ basePath }: Props) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projects, loading } = useAppSelector((s) => s.projects)
  const { user } = useAppSelector((s) => s.auth)
  const { clients, loading: clientsLoading } = useAppSelector((s) => s.clients)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'planning',
      priority: 'medium',
      clientId: '',
    },
  })

  const canManageProjects = user?.role === 'admin'
  const clientOptions = clients.filter((client) => client.role?.toLowerCase() === 'client')

  useEffect(() => {
    dispatch(fetchProjects())
    if (user?.role === 'admin') {
      dispatch(fetchClients(user.company || 'digiayudh'))
    }
  }, [dispatch, user?.role, user?.company])

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      // const projectData = {
      //   title: data.title,
      //   description: data.description,
      //   status: data.status,
      //   priority: data.priority,
      //   startDate: new Date(data.startDate),
      //   endDate: data.endDate ? new Date(data.endDate) : undefined,
      //   budget: data.budget ? Number(data.budget) : undefined,
      //   managerId: user?._id,
      //   clientId: user?.role === 'client' ? user._id : undefined,
      //   company: 'digiayudh',
      //}
      const projectData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        budget: data.budget ? Number(data.budget) : undefined,
        clientId: data.clientId || undefined,
      }

      console.log('Project submit payload:', projectData)

      if (editingId) {
        const response = await apiClient.updateProject(editingId, projectData)
        console.log('Project update response:', response)
        toast.success('Project updated successfully')
      } else {
        const response = await apiClient.createProject(projectData)
        console.log('Project create response:', response)
        toast.success('Project created successfully')
      }

      dispatch(fetchProjects())
      setIsOpen(false)
      setEditingId(null)
      reset()
    } catch (error) {
      console.error('Project save error:', error)
      toast.error('Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingId(project._id)
    reset({
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate?.toString().split('T')[0],
      endDate: project.endDate?.toString().split('T')[0],
      budget: project.budget?.toString(),
      clientId: project.clientId ?? '',
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      await apiClient.deleteProject(id)
      toast.success('Project deleted successfully')
      dispatch(fetchProjects())
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Projects" subtitle="Browse and track all projects." />
        {canManageProjects && (
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
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update project details' : 'Create a new project for your team'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Website Redesign"
                    {...register('title')}
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Project overview and goals"
                    rows={3}
                    {...register('description')}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      {...register('status')}
                      className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      {...register('priority')}
                      className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                    />
                    {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...register('budget')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Assign Client</Label>
                  <select
                    id="clientId"
                    {...register('clientId')}
                    className="w-full h-10 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Select client</option>
                    {clientOptions.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                        {client.companyName ? ` - ${client.companyName}` : ''}
                      </option>
                    ))}
                  </select>
                  {clientsLoading && <p className="text-xs text-text-light">Loading clients...</p>}
                  {!clientsLoading && clientOptions.length === 0 && (
                    <p className="text-xs text-text-light">No clients available yet.</p>
                  )}
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
                    {isSubmitting ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Input
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {loading && projects.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FolderKanban className="h-6 w-6" />} title="No projects found" description="Try adjusting your search or check back later." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card
              key={p._id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="space-y-3 p-5">
                <div
                  onClick={() => navigate(`${basePath}/${p._id}`)}
                  className="cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight text-pretty">{p.title}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="line-clamp-2 text-sm text-text-light">{p.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-text-light">
                      <span>Progress</span>
                      <span>{projectProgress(p.status)}%</span>
                    </div>
                    <Progress value={projectProgress(p.status)} />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs text-text-light">
                    <span>Due {formatDate(p.endDate)}</span>
                    {p.budget ? <span className="font-medium text-text">{formatCurrency(p.budget)}</span> : null}
                  </div>
                </div>
                {canManageProjects && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(p)
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(p._id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
