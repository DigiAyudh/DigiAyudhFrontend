import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ExternalLink,
  Star,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Quote,
  GitBranch,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../common/section-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { portfolioApi } from '../../services/portfolioApi';
import type { PortfolioProject, ProjectReview } from '../../types/portfolio.types';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap: Record<string, string> = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const sizeClass = sizeMap[size] || 'h-3 w-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${sizeClass} ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ProjectReview }) {
  const clientName = typeof review.client === 'object' ? review.client.name : 'Anonymous';
  const clientInitial = clientName.charAt(0).toUpperCase();
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-sm font-semibold text-purple-400">{clientInitial}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{clientName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="mt-1"><StarRating rating={review.rating} size="sm" /></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectDetailView({ project, onBack }: { project: PortfolioProject; onBack: () => void }) {
  const [reviews, setReviews] = useState<ProjectReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fn = async () => {
      setReviewsLoading(true);
      try {
        if (project.reviews && project.reviews.length > 0) {
          setReviews(project.reviews);
        } else {
          const res = await portfolioApi.getProjectReviews(project._id);
          if (res.success) {
  const reviewData = Array.isArray(res.data)
    ? res.data
    : Array.isArray((res.data as any)?.reviews)
      ? (res.data as any).reviews
      : [];

  setReviews(reviewData);
}
        }
      } catch (e) { console.error(e); }
      finally { setReviewsLoading(false); }
    };
    fn();
  }, [project._id, project.reviews]);

  const screenshots = Array.isArray(project.screenshots)
  ? project.screenshots
  : [];

const allImages = [
  project.thumbnail,
  ...screenshots,
].filter(Boolean) as string[];
  const avg = project.rating?.averageRating || 0;
  const cnt = project.rating?.reviewCount || 0;

  return (
    <div className="flex flex-col h-full">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to all projects
      </button>
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative aspect-video lg:aspect-[21/9]">
            {allImages.length > 0 ? (
              <img src={allImages[currentImageIndex]} alt={project.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/20 to-stone-900/20">
                <span className="text-6xl font-bold text-muted-foreground/10">{project.title.charAt(0)}</span>
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setCurrentImageIndex(p => p === 0 ? allImages.length - 1 : p - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-all">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setCurrentImageIndex(p => p === allImages.length - 1 ? 0 : p + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImageIndex(i)} className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/70 w-1.5'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {project.category && <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">{project.category}</Badge>}
              {project.status && <Badge variant={project.status === 'published' ? 'default' : 'secondary'} className={project.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/30 text-xs' : 'text-xs'}>{project.status}</Badge>}
            </div>
            <h2 className="text-2xl font-bold">{project.title}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" className="gap-2"><ExternalLink className="h-4 w-4" /> View Live Project</Button></a>}
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="gap-2"><GitBranch className="h-4 w-4" /> View Source Code</Button></a>}
        </div>

        {project.technologyStack.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologyStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="bg-purple-500/5 text-purple-400 border-purple-500/20 text-xs">{tech}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {project.clientInfo?.name && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{project.clientInfo.name}</span>
              {project.clientInfo?.company && <span className="text-muted-foreground/60"> &middot; {project.clientInfo.company}</span>}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              Client Review{reviews.length > 0 && <span className="ml-1.5 text-sm text-muted-foreground font-normal">({reviews.length})</span>}
            </h3>
            {cnt > 0 && <div className="flex items-center gap-1.5"><StarRating rating={avg} size="sm" /><span className="text-sm font-medium">{avg.toFixed(1)}</span></div>}
          </div>
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-purple-400" /></div>
          ) : reviews.length === 0 ? (
            <Card className="border-dashed border-border"><CardContent className="flex flex-col items-center justify-center py-8"><Quote className="h-6 w-6 text-muted-foreground/50" /><p className="mt-2 text-sm text-muted-foreground">No reviews yet for this project.</p></CardContent></Card>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">{reviews.map((r) => <ReviewCard key={r._id} review={r} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AllProjectsGrid({ projects, onProjectClick, loading }: { projects: PortfolioProject[]; onProjectClick: (p: PortfolioProject) => void; loading: boolean }) {
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>;
  if (projects.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted"><ExternalLink className="h-6 w-6 text-muted-foreground" /></div>
      <h3 className="mt-4 text-lg font-semibold">No projects available</h3>
      <p className="mt-1 text-sm text-muted-foreground">Check back later for new projects.</p>
    </div>
  );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }}
          className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-purple-500/30 hover:shadow-md"
          onClick={() => onProjectClick(project)}
        >
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-purple-900/10 to-stone-900/10">
            {project.thumbnail ? (
              <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                <span className="text-4xl font-bold text-muted-foreground/20">{project.title.charAt(0)}</span>
              </div>
            )}
            {project.category && <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">{project.category}</span>}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-sm">{project.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
            {project.technologyStack.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {project.technologyStack.slice(0, 3).map((tech) => <span key={tech} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{tech}</span>)}
                {project.technologyStack.length > 3 && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">+{project.technologyStack.length - 3}</span>}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              {project.rating && project.rating.reviewCount > 0 ? (
                <div className="flex items-center gap-1.5"><StarRating rating={project.rating.averageRating} /><span className="text-[10px] text-muted-foreground">{project.rating.averageRating.toFixed(1)} ({project.rating.reviewCount})</span></div>
              ) : <span className="text-[10px] text-muted-foreground">No reviews</span>}
              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-400 hover:text-purple-300 transition-colors"><ExternalLink className="h-3 w-3" /> Live</a>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PortfolioSection() {
  const [featuredProjects, setFeaturedProjects] = useState<PortfolioProject[]>([]);
  const [allProjects, setAllProjects] = useState<PortfolioProject[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [allProjectsLoading, setAllProjectsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    const fn = async () => {
      setFeaturedLoading(true);
      try {
        const res = await portfolioApi.getFeaturedProjects();
        if (res.success) setFeaturedProjects(res.data);
      } catch (e) { console.error(e); }
      finally { setFeaturedLoading(false); }
    };
    fn();
  }, []);

  const handleOpenOverlay = async () => {
    setShowOverlay(true);
    setSelectedProject(null);
    if (allProjects.length === 0) {
      setAllProjectsLoading(true);
      try {
        const res = await portfolioApi.getAllProjects({ limit: 50 });
        if (res.success) setAllProjects(res.data);
      } catch (e) { console.error(e); }
      finally { setAllProjectsLoading(false); }
    }
  };

  if (featuredLoading) return (
    <section id="work" className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader badge="Selected work" title="Products we&apos;re proud of." description="Real solutions, designed around real business goals." />
        <div className="mt-16 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
      </div>
    </section>
  );
  if (featuredProjects.length === 0) return null;

  const featured = featuredProjects[0];
  const others = featuredProjects.slice(1);

  return (
    <>
      <section id="work" className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader badge="Selected work" title="Products we&apos;re proud of." description="Real solutions, designed around real business goals." />
          <div className="mt-16 flex flex-col gap-6 lg:gap-8">
            {featured && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -4 }}
                className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
                onClick={() => { setSelectedProject(featured); setShowOverlay(true); }}
              >
                <div className="grid lg:grid-cols-2">
                  <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900/20 to-stone-900/20 lg:min-h-[360px]">
                    {featured.thumbnail ? (
                      <img src={featured.thumbnail} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                        <span className="text-4xl font-bold text-muted-foreground/30">{featured.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <p className="text-xs font-medium tracking-widest text-purple-400">{featured.category?.toUpperCase() || 'FEATURED PROJECT'}</p>
                    <h3 className="mt-2 text-2xl font-bold">{featured.title}</h3>
                    <p className="mt-3 line-clamp-3 text-muted-foreground">{featured.description}</p>
                    {featured.rating && featured.rating.reviewCount > 0 && (
                      <div className="mt-4 flex items-center gap-2">
                        <StarRating rating={featured.rating.averageRating} />
                        <span className="text-xs text-muted-foreground">{featured.rating.averageRating.toFixed(1)} ({featured.rating.reviewCount})</span>
                      </div>
                    )}
                    <div className="mt-6 flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-400 group-hover:text-purple-300">View project details<ArrowUpRight className="size-4" /></span>
                      {featured.liveUrl && <a href={featured.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="size-3" /> Live</a>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {others.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
                {others.map((project, i) => (
                  <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-purple-500/30 hover:shadow-md cursor-pointer"
                    onClick={() => { setSelectedProject(project); setShowOverlay(true); }}
                  >
                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900/10 to-stone-900/10">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                          <span className="text-3xl font-bold text-muted-foreground/30">{project.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-medium tracking-widest text-purple-400">{project.category?.toUpperCase() || 'PROJECT'}</p>
                      <h3 className="mt-1 font-semibold">{project.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        {project.rating && project.rating.reviewCount > 0 ? (
                          <div className="flex items-center gap-1.5"><StarRating rating={project.rating.averageRating} /><span className="text-xs text-muted-foreground">{project.rating.averageRating.toFixed(1)}</span></div>
                        ) : <span />}
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"><ExternalLink className="size-3" /> Live Project</a>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-8">
              <Button onClick={handleOpenOverlay} variant="outline" size="lg" className="gap-2 rounded-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10">View More<ArrowUpRight className="size-4" /></Button>
            </div>
          </div>
        </div>
      </section>
      <Dialog open={showOverlay} onOpenChange={(open) => { if (!open) { setShowOverlay(false); setSelectedProject(null); } }}>
        <DialogContent className="w-[95vw] max-w-[1400px] h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">{selectedProject ? selectedProject.title : 'All Projects'}</DialogTitle>
              {/* <button onClick={() => { setShowOverlay(false); setSelectedProject(null); }} className="rounded-md p-1.5 opacity-70 transition-opacity hover:opacity-100 hover:bg-muted"><X className="h-5 w-5" /></button> */}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
            {selectedProject ? (
              <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} />
            ) : (
              <div className="h-full overflow-y-auto pr-1">
                <AllProjectsGrid projects={allProjects} onProjectClick={(p) => setSelectedProject(p)} loading={allProjectsLoading} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
