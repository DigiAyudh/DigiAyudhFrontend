import {
  Briefcase,
  Building2,
  Cloud,
  Globe,
  LayoutDashboard,
  Package,
  Rocket,
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/common/section-header';
import { services } from '@/constants/landing.data';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  LayoutDashboard,
  Smartphone,
  Building2,
  Users,
  UserCheck,
  Package,
  Briefcase,
  Sparkles,
  Cloud,
  Workflow,
  Rocket,
};

const accentMap = {
  purple: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/20',
  green: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/20',
  blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20',
  red: 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/20',
  amber: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20',
  cyan: 'from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/20',
};

export function ServicesSection() {
  return (
    <section id="services" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="What we do"
          title="Everything you need to win online."
          description="Strategy, design, technology and growth—working together under one roof."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Globe;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5"
              >
                {service.badge && (
                  <Badge variant="brand" className="absolute right-4 top-4">
                    {service.badge}
                  </Badge>
                )}

                <div
                  className={cn(
                    'mb-4 flex size-10 items-center justify-center rounded-xl border bg-gradient-to-br',
                    accentMap[service.accent],
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>

                <ul className="mt-4 space-y-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-purple-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-purple-400 transition-colors group-hover:text-purple-300"
                >
                  Explore service →
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
