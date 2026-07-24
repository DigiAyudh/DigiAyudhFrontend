import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Star, Search, ChevronLeft, ChevronRight, Loader2, ArrowUpRight, ArrowLeft, } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { portfolioApi } from '../services/portfolioApi';
import type { PortfolioProject } from '../types/portfolio.types';
import { PublicNavbar } from '@/components/public/public-navbar';
import { PublicFooter } from '@/components/public/public-footer';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

export default function PortfolioListingPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          portfolioApi.getAllProjects({ page, limit: 12, category: selectedCategory || undefined }),
          portfolioApi.getCategories(),
        ]);
        if (projectsRes.success) {
          setProjects(projectsRes.data);
          if (projectsRes.pagination) {
            setTotalPages(projectsRes.pagination.pages);
          }
        }
        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.technologyStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
  
    <div className="min-h-screen bg-background">
        
      {/* Back Navigation */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-purple-500/5 to-transparent py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium tracking-widest text-purple-400">OUR PORTFOLIO</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Products we're
              <span className="text-purple-400"> proud of</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Real solutions, designed around real business goals. Explore our work across industries and platforms.
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto mt-8 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-card border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-purple-500/10 hover:text-purple-400'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-purple-500/10 hover:text-purple-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project, i) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-purple-500/30 hover:shadow-lg"
                    onClick={() => navigate(`/portfolio/${project._id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-900/10 to-stone-900/10">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                          <span className="text-5xl font-bold text-muted-foreground/20">
                            {project.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Category Badge */}
                      {project.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          {project.category}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      {project.technologyStack.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.technologyStack.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologyStack.length > 4 && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              +{project.technologyStack.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rating & Live Button */}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        {project.rating && project.rating.reviewCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <StarRating rating={project.rating.averageRating} />
                            <span className="text-xs text-muted-foreground">
                              ({project.rating.reviewCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No reviews yet</span>
                        )}
                        <a
                          href={project.liveUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Live
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <PublicFooter></PublicFooter>
    </div>
  );
}
