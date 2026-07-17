import { ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/common/section-header';
import { stats, whyUsPoints } from '@/constants/landing.data';

export function WhyUsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionHeader
              badge="Why DigiAyudh"
              title="Built like your growth depends on it."
              description="Because it does. We combine sharp design, solid engineering and business thinking to create digital products that perform—not just look good."
              align="left"
            />

            <ul className="mt-10 space-y-6">
              {whyUsPoints.map((point, i) => (
                <motion.li
                  key={point.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <Check className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{point.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <a
              href="#process"
              className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              How we work
              <ArrowUpRight className="size-4" />
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8"
          >
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-gradient sm:text-4xl">
                    {stat.value}
                    {stat.suffix}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average launch time</p>
                  <p className="text-2xl font-bold">2–4 weeks</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <ArrowUpRight className="size-5" />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-violet-600 to-purple-600" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-green-400" />
                Verified enterprise delivery standards
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
