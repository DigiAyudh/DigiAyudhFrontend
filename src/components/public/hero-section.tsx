import { ArrowUpRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HeroDashboardMockup } from '../common/hero-dashboard-mockup';
import { APP_CONFIG } from '@/config/navigation';
import { Sparkles } from "lucide-react";



const avatars = [
  { initials: 'AK', bg: 'from-pink-500 to-red-500' },
  { initials: 'GD', bg: 'from-orange-500 to-yellow-500' },
  { initials: 'ME', bg: 'from-green-500 to-teal-500' },
  { initials: 'VT', bg: 'from-blue-500 to-purple-500' },
  { initials: 'PL', bg: 'from-purple-500 to-pink-500' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl pt-10 md:pt-0">
        <div className="mb-6 flex justify-center">
          {/* <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-12 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-400"
          >
            ✦ {APP_CONFIG.tagline}
          </motion.span> */}


          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-flex"
          >
            <div className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(139,92,246,0.12)]">

              {/* Premium Shine */}
              <motion.div
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-primary/20 to-transparent -skew-x-12"
                animate={{
                  x: ["-150%", "450%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "linear",
                }}
              />

              <div className="relative flex items-center gap-2 px-5 py-2.5">
                <motion.div
                  animate={{
                    opacity: [0.9, 1, 0.9],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </motion.div>

                <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-sm font-semibold tracking-wide text-transparent">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hero-heading-font text-4xl font-extrabold leading-[1.25] tracking-tight sm:text-5xl lg:text-6xl"
            >
              We build digital products that{' '}
              <span className="mx-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-500 bg-clip-text font-semibold tracking-[0.08em] text-transparent drop-shadow-[0_0_18px_rgba(167,139,250,0.25)]">
                move businesses
              </span>{' '}
              forward.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-xl gap-12 text-lg leading-8 text-muted-foreground"
            >
              From a powerful first website to a complete business operating system—we design,
              build and launch digital experiences made for real growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a href="#contact" className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-violet-600 px-5 font-bold text-white shadow-xl shadow-violet-950/30 transition-all duration-300 hover:bg-violet-500">
                <span>Build my product</span>

                <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={2.2} />
              </a>

              <a href="#work" className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-white/15 px-5 font-bold text-white transition-all duration-300 hover:border-violet-300/50 hover:bg-white/5">
                <Play className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.2} fill="currentColor" />

                <span>See our work</span>
              </a>
            </motion.div>



            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.initials}
                    className={`flex size-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br ${avatar.bg} text-[10px] font-bold text-white`}
                  >
                    {avatar.initials}
                  </div>
                ))}
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                  +
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  <span className="text-amber-400">★★★★★</span> 4.9
                </p>
                <p className="text-xs text-muted-foreground">
                  Trusted by 120+ growing businesses
                </p>
              </div>
            </motion.div>
          </div>

          <HeroDashboardMockup className="mx-auto w-full max-w-lg lg:max-w-none" />
        </div>
      </div>
    </section>
  );
}
