// import { motion } from 'framer-motion';
// import { testimonial } from '@/constants/landing.data';

// export function TestimonialSection() {
//   return (
//     <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
//       <div className="mx-auto max-w-4xl">
//         <motion.blockquote
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center"
//         >
//           <span className="text-6xl font-serif text-purple-400/50">"</span>
//           <p className="mt-4 text-xl font-medium leading-relaxed sm:text-2xl lg:text-3xl">
//             {testimonial.quote}
//           </p>

//           <footer className="mt-10 flex flex-col items-center gap-4">
//             <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
//               {testimonial.avatar}
//             </div>
//             <div>
//               <p className="font-semibold">{testimonial.author}</p>
//               <p className="text-sm text-muted-foreground">
//                 {testimonial.role}, {testimonial.company}
//               </p>
//             </div>
//             {testimonial.metric && (
//               <div className="mt-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
//                 {testimonial.metric} {testimonial.metricLabel}
//               </div>
//             )}
//           </footer>
//         </motion.blockquote>
//       </div>
//     </section>
//   );
// }

import { motion } from 'framer-motion';
import { testimonial } from '@/constants/landing.data';

export function TestimonialSection() {
  return (
    <section className="relative overflow-hidden border-y border-border/50 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />

      <div className="absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
            From the Founder
          </p>
          <div className="relative mx-auto mt-8 max-w-4xl">
            <span className="absolute -left-4 -top-10 font-serif text-7xl leading-none text-purple-500/20 sm:-left-8">
              “
            </span>

            <p className="relative text-xl font-medium leading-relaxed tracking-tight sm:text-2xl lg:text-3xl">
              {testimonial.quote}
            </p>

            <span className="absolute -bottom-12 right-0 font-serif text-7xl leading-none text-purple-500/20">
              ”
            </span>
          </div>

          <footer className="mt-12 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl" />

              <div className="relative flex size-14 items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                {testimonial.avatar}
              </div>
            </div>

            <p className="mt-4 text-base font-bold">
              {testimonial.author}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {testimonial.role} · {testimonial.company}
            </p>

            {/* {testimonial.metric && (
              <div className="mt-6 flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-5 py-2 text-sm">
                <span className="font-semibold text-purple-400">
                  {testimonial.metric}
                </span>

                <span className="text-muted-foreground">
                  {testimonial.metricLabel}
                </span>
              </div>
            )} */}
          {testimonial.metric && (
           <div className="mt-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
              {testimonial.metric} {testimonial.metricLabel}
             </div>
          )}
          </footer>
        </motion.div>
      </div>
    </section>
  );
}

