import {
  Search,
  PenTool,
  Code2,
  ShieldCheck,
  Rocket,
  Settings,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "../common/section-header";

const processSteps = [
  {
    id: "01",
    title: "Research",
    subtitle: "Consultation & Requirement Gathering",
    description:
      "We understand your business goals, target audience, competitors, and define the project scope before development begins.",
    icon: Search,
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "02",
    title: "Design",
    subtitle: "UI/UX & Product Architecture",
    description:
      "Our team designs modern user experiences, wireframes, prototypes, and scalable software architecture.",
    icon: PenTool,
    color: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "03",
    title: "Development",
    subtitle: "Coding & Optimization",
    description:
      "We build fast, secure, and scalable applications using the latest technologies and best coding practices.",
    icon: Code2,
    color: "from-cyan-500/20 to-blue-500/20",
  },
  {
    id: "04",
    title: "Testing",
    subtitle: "Quality Assurance",
    description:
      "Every feature is tested for performance, security, usability, and reliability before release.",
    icon: ShieldCheck,
    color: "from-emerald-500/20 to-green-500/20",
  },
  {
    id: "05",
    title: "Deployment",
    subtitle: "Launch & Go Live",
    description:
      "Your project is deployed on secure cloud infrastructure with monitoring and optimization.",
    icon: Rocket,
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "06",
    title: "Maintenance",
    subtitle: "Support & Updates",
    description:
      "We continuously monitor, maintain, improve, and support your software after launch.",
    icon: Settings,
    color: "from-indigo-500/20 to-violet-500/20",
  },
];

export function ProcessSection() {
  return (
    <section
      id="process"
      className="relative overflow-hidden border-y border-border/50 py-20"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <SectionHeader
          badge="Development Process"
          title="How We Build World-Class Digital Products"
          description="A simple, transparent, and proven workflow that transforms your ideas into secure, scalable, and high-performance digital solutions."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {processSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -8,
                }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                {/* Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div className="relative p-8">

                  <div className="mb-8 flex items-center justify-between">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-8 w-8 text-purple-400" />
                    </div>

                    <span className="text-5xl font-black text-border transition-colors duration-300 group-hover:text-purple-500/30">
                      {step.id}
                    </span>

                  </div>
                                    <h3 className="text-2xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-purple-400">
                    {step.subtitle}
                  </p>

                  <p className="mt-5 text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Divider */}
                  <div className="my-6 h-px bg-border" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">

                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      Step {step.id}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-purple-500 group-hover:bg-purple-500 group-hover:text-white">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>

                  </div>

                  {/* Floating Glow */}
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          <div className="rounded-2xl border border-border bg-card px-8 py-5 text-center shadow-lg">
            <p className="text-lg font-semibold">
              Ready to turn your idea into reality?
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Let's build secure, scalable and modern software together.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}