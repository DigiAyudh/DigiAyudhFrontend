import { trustedClients } from '@/constants/landing.data';

// export function TrustedBySection() {
//   return (
//     <section className="border-y border-border/50 px-4 py-12 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-7xl">
//         <p className="mb-8 text-center text-sm text-muted-foreground">
//           Trusted by ambitious teams across industries
//         </p>
//         <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
//           {trustedClients.map((client) => (
//             <div
//               key={client.id}
//               className="flex items-center gap-2 text-lg font-semibold text-muted-foreground/60 transition-colors hover:text-muted-foreground"
//             >
//               <span className="text-purple-400">{client.logo}</span>
//               {client.name}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
import { motion } from "framer-motion";

export function TrustedBySection() {
  return (
    <section className="relative overflow-hidden border-y border-border/50 py-16">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground"
        >
          TRUSTED BY GROWING BUSINESSES
        </motion.p>

        <div className="relative overflow-hidden">
  {/* Left Fade */}
  <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />

  {/* Right Fade */}
  <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

  <motion.div
    className="flex w-max gap-6"
    animate={{
      x: ["0%", "-50%"],
    }}
    transition={{
      duration: 25,
      repeat: Infinity,
      ease: "linear",
    }}
  >
    {[...trustedClients, ...trustedClients].map((client, index) => (
  <div
    key={`${client.id}-${index}`}
    className="group flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
  >
    <img
      src={client.logo}
      alt={client.name}
      className="h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
    />
  </div>
))}
  </motion.div>
</div>

      </div>
    </section>
  );
}
