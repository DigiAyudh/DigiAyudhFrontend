import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../common/section-header';
import { portfolioProjects } from '@/constants/landing.data';
import { cn } from '@/lib/utils';

export function PortfolioSection() {
  const featured = portfolioProjects.find((p) => p.featured);
  const others = portfolioProjects.filter((p) => !p.featured);

  return (
    <section id="work" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Selected work"
          title="Products we're proud of."
          description="Real solutions, designed around real business goals."
        />

        <div className="mt-16 flex flex-col gap-6 lg:gap-8">
          {featured && (
            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5"
            >
              <div className="grid lg:grid-cols-2">
                <div
                  className={cn(
                    'flex min-h-[280px] flex-col justify-between bg-gradient-to-br p-8 lg:min-h-[360px] lg:p-12',
                    featured.gradient ?? 'from-stone-100 to-stone-200',
                  )}
                >
                  <div>
                    <p className="text-xs font-medium tracking-widest text-stone-500">
                      lumera.store
                    </p>
                    <p className="mt-4 text-xs font-semibold tracking-widest text-stone-600">
                      LUMÉRA
                    </p>
                    <nav className="mt-2 flex gap-4 text-xs text-stone-500">
                      <span>Shop</span>
                      <span>Collections</span>
                      <span>About</span>
                      <span>Bag (2)</span>
                    </nav>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-500">NEW COLLECTION</p>
                    <h3 className="mt-2 text-3xl font-light text-stone-800 lg:text-4xl">
                      Objects for
                      <br />
                      slower living.
                    </h3>
                    <p className="mt-4 text-sm text-stone-600">Shop collection →</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <p className="text-xs font-medium tracking-widest text-purple-400">
                    {featured.category}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{featured.title}</h3>
                  <p className="mt-3 text-muted-foreground">{featured.description}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-purple-400 group-hover:text-purple-300">
                    View case study
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </div>
            </motion.a>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {others.map((project, i) => (
              <motion.a
                key={project.id}
                href="#contact"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-purple-500/30 hover:shadow-md"
              >
                <div
                  className={cn(
                    'flex min-h-[200px] flex-col justify-end bg-gradient-to-br p-6',
                    project.gradient,
                  )}
                >
                  {project.id === 'viora' && (
                    <>
                      <p className="text-xs text-white/80">Good morning, Ayush</p>
                      <h4 className="mt-1 text-xl font-bold text-white">
                        Your wellness,
                        <br />
                        in one place.
                      </h4>
                      <p className="mt-2 text-2xl font-bold text-white">82 score</p>
                    </>
                  )}
                  {project.id === 'scaleos' && (
                    <>
                      <p className="text-xs text-slate-400">PERFORMANCE</p>
                      <h4 className="mt-1 text-lg font-bold text-white">Campaign analytics</h4>
                      <div className="mt-3 flex gap-6">
                        <div>
                          <p className="text-lg font-bold text-white">₹2.4M</p>
                          <p className="text-xs text-slate-400">Revenue</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">8.7x</p>
                          <p className="text-xs text-slate-400">ROAS</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs font-medium tracking-widest text-purple-400">
                    {project.category}
                  </p>
                  <h3 className="mt-1 font-semibold">{project.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
