import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, LifeBuoy, DollarSign, FileText, ArrowRight, Calendar, Star, MessageSquare, Pencil, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchDashboardStats } from '../../redux/slices/dashboardSlice'
import { fetchProjects } from '../../redux/slices/projectsSlice'
import { fetchInvoices, fetchMeetings } from '../../redux/slices/businessSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Progress } from '../../components/ui/progress'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
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
import { formatCurrency, formatDate, projectProgress } from '../../lib/utils'
import { portfolioApi } from '../../services/portfolioApi'
import type { ProjectReview, PortfolioProject } from '../../types/portfolio.types'
import toast from 'react-hot-toast'

const STAT_ICONS = [FolderKanban, LifeBuoy, DollarSign, FileText]

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-all hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground hover:text-yellow-400'
              }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, onEdit }: { review: ProjectReview; onEdit: () => void }) {
  const clientName = typeof review.client === 'object' ? review.client.name : 'Anonymous'
  const initial = clientName.charAt(0).toUpperCase()

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-sm font-semibold text-purple-400">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{clientName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                        }`}
                    />
                  ))}
                </div>
                <StatusBadge status={review.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.review}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit} className="shrink-0">
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ClientDashboard() {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((s) => s.dashboard)
  const { projects } = useAppSelector((s) => s.projects)
  const { invoices, meetings } = useAppSelector((s) => s.business)
  const { user } = useAppSelector((s) => s.auth)

  const [reviews, setReviews] = useState<ProjectReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchReviews = async () => {
    try {
      const res = await portfolioApi.getMyReviews()
      if (res.success) setReviews(res.data)
    } catch {
      // Silently fail if API not ready
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchPortfolioProjects = async () => {
    try {
      const res = await portfolioApi.getAllProjects({ limit: 50 })
      if (res.success) setPortfolioProjects(res.data)
    } catch {
      // Silently fail
    }
  }

  useEffect(() => {
    dispatch(fetchDashboardStats('client'))
    dispatch(fetchProjects())
    dispatch(fetchInvoices())
    dispatch(fetchMeetings())
    fetchReviews()
    fetchPortfolioProjects()
  }, [dispatch])

  const handleSubmitReview = async () => {
    if (!selectedProject || !rating || !reviewText.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setIsSubmitting(true)
    try {
      if (editingReview) {
        const res = await portfolioApi.updateReview(editingReview, { rating, review: reviewText })
        if (res.success) {
          toast.success('Review updated')
          setReviews((prev) =>
            prev.map((r) => (r._id === editingReview ? { ...r, rating, review: reviewText } : r))
          )
        }
      } else {
        const res = await portfolioApi.createReview({
          projectId: selectedProject,
          rating,
          review: reviewText,
        } as any);
        if (res.success) {
          toast.success('Review submitted')
          setReviews((prev) => [res.data, ...prev])
        }
      }
      setDialogOpen(false)
      setSelectedProject('')
      setRating(0)
      setReviewText('')
      setEditingReview(null)
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (review: ProjectReview) => {
    setEditingReview(review._id)
    const projectId = typeof review.project === 'object' ? review.project._id : review.project
    setSelectedProject(projectId)
    setRating(review.rating)
    setReviewText(review.review)
    setDialogOpen(true)
  }

  const handleOpenNewReview = () => {
    setEditingReview(null)
    setSelectedProject('')
    setRating(0)
    setReviewText('')
    setDialogOpen(true)
  }

  const upcoming = [...meetings]
    .filter((m) => new Date(m.start).getTime() > Date.now() - 86400000)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Track your projects, invoices, meetings and reviews." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} icon={STAT_ICONS[i % STAT_ICONS.length]} index={i} />
          ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My Projects</CardTitle>
            <Link to="/client/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 5).map((p) => (
              <Link key={p._id} to={`/client/projects/${p._id}`} className="block space-y-1.5 rounded-lg p-2 hover:bg-muted">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <Progress value={projectProgress(p.status)} />
              </Link>
            ))}
            {projects.length === 0 && <p className="py-4 text-center text-sm text-text-light">No active projects</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Upcoming Meetings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {upcoming.map((m) => (
                <div key={m._id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-text-light">{formatDate(m.start)}</p>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && <p className="py-2 text-center text-sm text-text-light">No meetings scheduled</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {invoices.slice(0, 3).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{inv.number}</p>
                    <p className="text-xs text-text-light">{formatCurrency(inv.total)}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
              ))}
              {invoices.length === 0 && <p className="py-2 text-center text-sm text-text-light">No invoices</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Reviews Section */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <CardTitle>My Reviews</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewReview} className="gap-2" size="sm">
                <MessageSquare className="h-4 w-4" />
                {reviews.length > 0 ? 'Write Another Review' : 'Write a Review'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingReview ? 'Edit Review' : 'Submit a Review'}</DialogTitle>
                <DialogDescription>
                  {editingReview ? 'Update your rating and feedback.' : 'Share your experience with a project.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                    disabled={!!editingReview}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolioProjects.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.title}
                        </SelectItem>
                      ))}
                      {portfolioProjects.length === 0 && (
                        <SelectItem value="-" disabled>
                          No projects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <StarInput value={rating} onChange={setRating} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback</label>
                  <Textarea
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {reviewText.length}/1000
                  </p>
                </div>
                <Button
                  onClick={handleSubmitReview}
                  className="w-full"
                  disabled={isSubmitting || !selectedProject || !rating || !reviewText.trim()}
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Star className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                You haven't written any reviews yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share your feedback on the projects you've worked with.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onEdit={() => handleEdit(review)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
