
// import { motion } from 'framer-motion';
// import { ClientReviewsSection as clientReviews } from '@/constants/landing.data';

// export function ClientReviewsSection() {
//   // Duplicate data for seamless infinite loop
//   const loopTestimonials = [...clientReviews, ...clientReviews];

//   return (
//     <section className="relative overflow-hidden border-y border-border/50 py-20">
//       {/* Background */}
//       <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />

//       {/* Glow */}
//       <div className="pointer-events-none absolute -left-40 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
//       <div className="pointer-events-none absolute -right-40 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

//       <div className="relative">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="mx-auto max-w-3xl px-4 text-center sm:px-6"
//         >
//           <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
//             Client Reviews
//           </p>

//           <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
//             What our clients say
//           </h2>

//           <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
//             Real experiences from businesses that trusted DigiAyudh
//             with their digital products.
//           </p>
//         </motion.div>

//         {/* Slider */}
//         <div className="relative mt-14 overflow-hidden">
//           <motion.div
//             className="flex w-max gap-5"
//             animate={{
//               x: ['0%', '-50%'],
//             }}
//             transition={{
//               x: {
//                 repeat: Infinity,
//                 repeatType: 'loop',
//                 duration: 30,
//                 ease: 'linear',
//               },
//             }}
//           >
//             {loopTestimonials.map((testimonial, index) => (
//               <motion.article
//                 key={`${testimonial.id}-${index}`}
//                 whileHover={{ y: -6 }}
//                 className="group relative w-[320px] shrink-0 overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 sm:w-[380px]"
//               >
//                 {/* Hover Glow */}
//                 <div className="absolute -right-16 -top-16 size-32 rounded-full bg-purple-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

//                 <div className="relative">
//                   {/* Author */}
//                   <div className="flex items-center gap-3">
//                     <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
//                       {testimonial.avatar}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate font-semibold">
//                         {testimonial.author}
//                       </p>

//                       <p className="truncate text-xs text-muted-foreground">
//                         {testimonial.role}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Company */}
//                   <p className="mt-5 text-sm font-semibold text-purple-400">
//                     {testimonial.company}
//                   </p>

//                   {/* Stars */}
//                   <div className="mt-3 text-sm tracking-wide text-yellow-400">
//                     ★★★★★
//                   </div>

//                   {/* Review */}
//                   <p className="mt-5 min-h-[150px] text-sm leading-7 text-muted-foreground">
//                     “{testimonial.quote}”
//                   </p>

//                   {/* Result */}
//                   {testimonial.metric && (
//                     <div className="mt-5 border-t border-border pt-4">
//                       <span className="font-semibold text-green-400">
//                         {testimonial.metric}
//                       </span>{' '}
//                       <span className="text-xs text-muted-foreground">
//                         {testimonial.metricLabel}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </motion.article>
//             ))}
//           </motion.div>
//         </div>

//         {/* Mobile hint */}
//         <p className="mt-7 text-center text-xs text-muted-foreground">
//           Swipe to explore client reviews
//         </p>
//       </div>
//     </section>
//   );
// }

import { ClientReviewsSection as clientReviews } from '@/constants/landing.data';

import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useState } from 'react';


export function ClientReviewsSection() {
    const controls = useAnimationControls();
    const [isPaused, setIsPaused] = useState(false);

    // Repeat enough times for a seamless loop
    const loopTestimonials = [
        ...clientReviews,
        ...clientReviews,
        ...clientReviews,
    ];

    useEffect(() => {
        if (isPaused) {
            controls.stop();
            return;
        }

        controls.start({
            x: ['0%', '-33.333%'],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 35,
                    ease: 'linear',
                },
            },
        });

        return () => controls.stop();
    }, [isPaused, controls]);

    return (
        <section className="relative overflow-hidden border-y border-border/50 py-20">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />
            <div className="pointer-events-none absolute -left-40 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-40 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-3xl px-4 text-center sm:px-6"
                >
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                        Client Reviews
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                        What our clients say
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        Real experiences from businesses that trusted DigiAyudh
                        with their digital products.
                    </p>
                </motion.div>

                <div
                    className="relative mt-14 overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <motion.div
                        className="flex w-max gap-5"
                        animate={controls}
                    >
                        {loopTestimonials.map((testimonial, index) => (
                            <motion.article
                                key={`${testimonial.id}-${index}`}
                                whileHover={{ y: -6 }}
                                className="
                  group relative w-[320px] shrink-0 overflow-hidden
                  rounded-3xl border border-border bg-card p-6
                  transition-all duration-300
                  hover:border-purple-500/30
                  hover:shadow-xl hover:shadow-purple-500/10
                  sm:w-[380px]
                "
                            >
                                <div
                                    className="
                    absolute -right-16 -top-16 size-32 rounded-full
                    bg-purple-500/10 blur-3xl opacity-0
                    transition-opacity duration-500
                    group-hover:opacity-100
                  "
                                />

                                <div className="relative">
                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="
                        flex size-11 shrink-0 items-center justify-center
                        rounded-full bg-gradient-to-br
                        from-violet-500 to-purple-600
                        text-sm font-bold text-white
                      "
                                        >
                                            {testimonial.avatar}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">
                                                {testimonial.author}
                                            </p>

                                            <p className="truncate text-xs text-muted-foreground">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-sm font-semibold text-purple-400">
                                        {testimonial.company}
                                    </p>


                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="flex text-sm tracking-wide">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const rating = Number(testimonial.metric);

                                                return (
                                                    <span key={star} className="relative">
                                                        <span className="text-muted-foreground/30">★</span>

                                                        <span
                                                            className="absolute left-0 top-0 overflow-hidden text-yellow-400"
                                                            style={{
                                                                width: `${Math.min(Math.max(rating - star + 1, 0), 1) * 100}%`,
                                                            }}
                                                        >
                                                            ★
                                                        </span>
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <span className="text-xs text-muted-foreground">
                                            {testimonial.metric}/5
                                        </span>
                                    </div>

                                    <p className="mt-5 min-h-[150px] text-sm leading-7 text-muted-foreground">
                                        “{testimonial.quote}”
                                    </p>
                                    {testimonial.metric && (
                                        <div className="mt-5 border-t border-border pt-4">
                                            <span className="font-semibold text-green-400">
                                                {testimonial.stats}
                                            </span>{' '}
                                            <span className="text-xs text-muted-foreground">
                                                {testimonial.statsLabel}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>

                <p className="mt-7 text-center text-xs text-muted-foreground">
                    Hover to pause
                </p>
            </div>
        </section>
    );
}
