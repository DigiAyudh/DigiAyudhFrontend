import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '../common/section-header';
import { pricingPlans } from '@/constants/landing.data';
import { cn } from '@/lib/utils';

export function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border/50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Simple pricing"
          title="Start lean. Scale when ready."
          description="Clear starting points. Every proposal is tailored to your actual goals."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-8',
                plan.highlighted
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'border-border',
              )}
            >
              {plan.badge && (
                <Badge variant="brand" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6">
                <p className="text-sm text-muted-foreground">Starts at</p>
                <p className="text-3xl font-bold">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.priceNote}</p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-purple-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'brand' : 'outline'}
                className="mt-8 w-full"
                asChild
              >
                <a href="#contact">{plan.cta}</a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
