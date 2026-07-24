import { useEffect, useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import { StatusBadge } from '../../components/common/StatusBadge'
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui/tabs'
import { portfolioApi } from '../../services/portfolioApi'
import type {
  PortfolioProject,
  ProjectReview,
} from '../../types/portfolio.types'
import { formatDate } from '../../lib/utils'

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnail: z.string().default(''),
  category: z.string().default(''),
  liveUrl: z.string().default(''),
  githubUrl: z.string().default(''),
  status: z.enum(['published', 'draft']).default('draft'),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().min(0).default(0),
  technologyStack: z.string().default(''),
  clientName: z.string().default(''),
  clientCompany: z.string().default(''),
})

type ProjectFormData = z.infer<typeof projectSchema>

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted'
          }`}
        />
      ))}
    </div>
  )
}

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('projects')
  const [reviews, setReviews] = useState<ProjectReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [selectedProjectReviews, setSelectedProjectReviews] = useState<string | null>(null)

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail: '',
      category: '',
      liveUrl: '',
      githubUrl: '',
      status: 'draft',
      featured: false,
      displayOrder: 0,
      technologyStack: '',
      clientName: '',
      clientCompany: '',
    },
  })

  const fetchProjects = async () => {
    try {
      const res = await portfolioApi.adminGetAllProjects({ limit: 50 })
      if (res.success) setProjects(res.data)
    } catch {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async (projectId?: string) => {
    setReviewsLoading(true)
    try {
      const res = await portfolioApi.adminGetAllReviews()
      if (res.success) {
        const filtered = projectId
          ? res.data.filter((r: ProjectReview) => {
              const pid = typeof r.project === 'object' ? r.project._id : r.project
              return pid === projectId
            })
          : res.data
        setReviews(filtered)
      }
    } catch {
      // Silently fail
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleOpenNew = () => {
    setEditingId(null)
    form.reset({
      title: '',
      description: '',
      thumbnail: '',
      category: '',
      liveUrl: '',
      githubUrl: '',
      status: 'draft',
      featured: false,
      displayOrder: 0,
      technologyStack: '',
      clientName: '',
      clientCompany: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (project: PortfolioProject) => {
    setEditingId(project._id)
    form.reset({
      title: project.title,
      description: project.description,
      thumbnail: project.thumbnail || '',
      category: project.category || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      status: project.status || 'draft',
      featured: project.featured || false,
      displayOrder: project.displayOrder || 0,
      technologyStack: project.technologyStack?.join(', ') || '',
      clientName: project.clientInfo?.name || '',
      clientCompany: project.clientInfo?.company || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    try {
      await portfolioApi.deleteProject(deleteDialog)
      toast.success('Project deleted')
      setProjects((prev) => prev.filter((p) => p._id !== deleteDialog))
      setDeleteDialog(null)
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        category: data.category,
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        status: data.status,
        featured: data.featured,
        displayOrder: data.displayOrder,
        technologyStack: data.technologyStack ? data.technologyStack.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        clientInfo: {
          name: data.clientName,
          company: data.clientCompany,
        },
      }

      if (editingId) {
        const res = await portfolioApi.updateProject(editingId, payload)
        if (res.success) {
          toast.success('Project updated')
          setProjects((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...res.data } : p)))
        }
      } else {
        const res = await portfolioApi.createProject(payload)
        if (res.success) {
          toast.success('Project created')
          setProjects((prev) => [res.data, ...prev])
        }
      }
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFeatured = async (project: PortfolioProject) => {
    try {
      const res = await portfolioApi.toggleFeatured(project._id)
      if (res.success) {
        toast.success(`Project ${project.featured ? 'unmarked' : 'marked'} as featured`)
        setProjects((prev) =>
          prev.map((p) => (p._id === project._id ? { ...p, featured: !p.featured } : p))
        )
      }
    } catch {
      toast.error('Failed to toggle featured status')
    }
  }

  const handleApproveReview = async (reviewId: string) => {
    try {
      const res = await portfolioApi.approveReview(reviewId)
      if (res.success) {
        toast.success('Review approved')
        setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, status: 'approved' } : r)))
      }
    } catch {
      toast.error('Failed to approve review')
    }
  }

  const handleRejectReview = async (reviewId: string) => {
    try {
      const res = await portfolioApi.rejectReview(reviewId)
      if (res.success) {
        toast.success('Review rejected')
        setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, status: 'rejected' } : r)))
      }
    } catch {
      toast.error('Failed to reject review')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await portfolioApi.deleteReview(reviewId)
      toast.success('Review deleted')
      setReviews((prev) => prev.filter((r) => r._id !== reviewId))
    } catch {
      toast.error('Failed to delete review')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append('images', file))
      const res = await portfolioApi.uploadImages(formData)
      if (res.success && res.data.length > 0) {
        form.setValue('thumbnail', res.data[0])
        toast.success('Image uploaded')
      }
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio Management"
        subtitle="Manage projects, reviews and featured content"
      >
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </PageHeader>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="h-6 w-6" />}
              title="No projects yet"
              description="Create your first portfolio project to showcase your work."
              action={
                <Button onClick={handleOpenNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const projectId = project._id
                return (
                  <Card key={projectId} className="group overflow-hidden border-border/50 hover:border-purple-500/30 transition-all">
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-900/10 to-stone-900/10">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute right-2 top-2 flex gap-1">
                        <Button variant="secondary" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(project)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="secondary" size="sm" className="h-7 w-7 p-0 text-red-400" onClick={() => setDeleteDialog(projectId)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold">{project.title}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">{project.category || 'Uncategorized'}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${project.featured ? 'text-yellow-400' : 'text-muted-foreground'}`}
                            onClick={() => handleToggleFeatured(project)}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                          <StatusBadge status={project.status === 'published' ? 'active' : 'inactive'} />
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {project.description}
                      </p>

                      {project.technologyStack && project.technologyStack.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.technologyStack.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologyStack.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              +{project.technologyStack.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-1 text-xs"
                          onClick={() => {
                            setSelectedProjectReviews(projectId)
                            fetchReviews(projectId)
                            setSelectedTab('reviews')
                          }}
                        >
                          <MessageSquare className="h-3 w-3" />
                          Reviews
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="No reviews yet"
              description="Client reviews will appear here once submitted."
            />
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const clientName = typeof review.client === 'object' ? review.client.name : 'Anonymous'
                const projectTitle = typeof review.project === 'object' ? review.project.title : 'Unknown Project'
                const initials = clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

                return (
                  <Card key={review._id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{clientName}</span>
                              <span className="text-xs text-muted-foreground">on {projectTitle}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <StarRating rating={review.rating} />
                              <StatusBadge status={review.status} />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{review.review}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {review.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-green-400" onClick={() => handleApproveReview(review._id)}>
                                <CheckCircle className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-red-400" onClick={() => handleRejectReview(review._id)}>
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400" onClick={() => handleDeleteReview(review._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the project details below.' : 'Fill in the details to create a new portfolio project.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="Project title" {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder="Project description" rows={4} {...form.register('description')} />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-400">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Thumbnail</Label>
                <div className="flex gap-2">
                  <Input placeholder="Image URL" {...form.register('thumbnail')} className="flex-1" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-background hover:bg-accent">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </Label>
                </div>
                {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. Web App, Mobile" {...form.register('category')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(v) => form.setValue('status', v as 'published' | 'draft')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live URL</Label>
                <Input id="liveUrl" placeholder="https://..." {...form.register('liveUrl')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input id="githubUrl" placeholder="https://github.com/..." {...form.register('githubUrl')} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="technologyStack">Technology Stack (comma separated)</Label>
                <Input id="technologyStack" placeholder="React, Node.js, MongoDB" {...form.register('technologyStack')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" placeholder="Client name" {...form.register('clientName')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientCompany">Client Company</Label>
                <Input id="clientCompany" placeholder="Company name" {...form.register('clientCompany')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input id="displayOrder" type="number" min="0" {...form.register('displayOrder')} />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="featured"
                  checked={form.watch('featured')}
                  onCheckedChange={(v) => form.setValue('featured', v)}
                />
                <Label htmlFor="featured">Featured project</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone. All associated reviews will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
