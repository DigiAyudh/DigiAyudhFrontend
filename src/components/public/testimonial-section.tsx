import { motion } from 'framer-motion';
import { testimonial } from '@/constants/landing.data';

export function TestimonialSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-6xl font-serif text-purple-400/50">"</span>
          <p className="mt-4 text-xl font-medium leading-relaxed sm:text-2xl lg:text-3xl">
            {testimonial.quote}
          </p>

          <footer className="mt-10 flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
              {testimonial.avatar}
            </div>
            <div>
              <p className="font-semibold">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
            {testimonial.metric && (
              <div className="mt-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
                {testimonial.metric} {testimonial.metricLabel}
              </div>
            )}
          </footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
