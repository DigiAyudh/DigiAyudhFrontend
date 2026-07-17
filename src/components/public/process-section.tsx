import { Code2, PenTool, Rocket, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../common/section-header';
import { processSteps } from '@/constants/landing.data';

const stepIcons = [Search, PenTool, Code2, Rocket];

export function ProcessSection() {
  return (
    <section id="process" className="border-y border-border/50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Simple process"
          title="From idea to impact in four clear steps."
        />

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-border lg:block" />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {processSteps.map((step, i) => {
              const Icon = stepIcons[i] ?? Search;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center lg:text-left"
                >
                  <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-border bg-card lg:mx-0">
                    <Icon className="size-8 text-purple-400" />
                    <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                      {String(step.step).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
