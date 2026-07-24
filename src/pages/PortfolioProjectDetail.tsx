import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Loader2,
  Quote,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { portfolioApi } from '../services/portfolioApi';
import type { PortfolioProject, ProjectReview } from '../types/portfolio.types';

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeMap[size]} ${
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ProjectReview }) {
  const clientName =
    typeof review.client === 'object' ? review.client.name : 'Anonymous';
  const clientInitial = clientName.charAt(0).toUpperCase();

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-sm font-semibold text-purple-400">
            {clientInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{clientName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="mt-1">
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {review.review}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PortfolioProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [reviews, setReviews] = useState<ProjectReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await portfolioApi.getProjectById(id);
        if (response.success) {
          setProject(response.data);
          if (response.data.reviews) {
            setReviews(response.data.reviews);
          }
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/portfolio')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to portfolio
        </Button>
      </div>
    );
  }

  const allImages = [
    project.thumbnail,
    ...project.screenshots,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/portfolio')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="relative h-[50vh] min-h-[400px] w-full">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/20 to-stone-900/20">
              <span className="text-8xl font-bold text-muted-foreground/10">
                {project.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Project Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                {project.category && (
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    {project.category}
                  </Badge>
                )}
                <Badge
                  variant={project.status === 'published' ? 'default' : 'secondary'}
                  className={
                    project.status === 'published'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : ''
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
                {project.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold">About This Project</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </motion.div>

              {/* Screenshots Gallery */}
              {allImages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="relative aspect-video">
                      <img
                        src={allImages[currentImageIndex]}
                        alt={`Screenshot ${currentImageIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? allImages.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-all"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === allImages.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                          {allImages.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImageIndex(i)}
                              className={`h-2 w-2 rounded-full transition-all ${
                                i === currentImageIndex
                                  ? 'bg-white w-6'
                                  : 'bg-white/50 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Client Reviews
                    {reviews.length > 0 && (
                      <span className="ml-2 text-lg text-muted-foreground font-normal">
                        ({reviews.length})
                      </span>
                    )}
                  </h2>
                  {project.rating && project.rating.reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={project.rating.averageRating} size="lg" />
                      <span className="text-lg font-semibold">
                        {project.rating.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <Card className="border-dashed border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Quote className="h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        No reviews yet for this project.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-3"
              >
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full gap-2" size="lg">
                      <ExternalLink className="h-4 w-4" />
                      View Live Project
                    </Button>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full gap-2" size="lg">
                      <GitBranch className="h-4 w-4" />
                      View Source Code
                    </Button>
                  </a>
                )}
              </motion.div>

              {/* Technology Stack */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologyStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="bg-purple-500/5 text-purple-400 border-purple-500/20"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.technologyStack.length === 0 && (
                        <p className="text-sm text-muted-foreground">No technologies listed</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Project Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">Project Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created:</span>
                        <span>
                          {new Date(project.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {project.clientInfo?.name && (
                        <div className="flex items-center gap-3 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Client:</span>
                          <span>{project.clientInfo.name}</span>
                        </div>
                      )}
                      {project.clientInfo?.company && (
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">Company:</span>
                          <span>{project.clientInfo.company}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Rating Summary */}
              {project.rating && project.rating.reviewCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Rating Summary</h3>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-purple-400">
                          {project.rating.averageRating.toFixed(1)}
                        </div>
                        <div>
                          <StarRating rating={project.rating.averageRating} size="md" />
                          <p className="mt-1 text-sm text-muted-foreground">
                            Based on {project.rating.reviewCount} review
                            {project.rating.reviewCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
