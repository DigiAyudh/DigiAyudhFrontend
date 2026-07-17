import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const chartData = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 55 },
  { month: 'Mar', value: 48 },
  { month: 'Apr', value: 62 },
  { month: 'May', value: 58 },
  { month: 'Jun', value: 72 },
  { month: 'Jul', value: 68 },
  { month: 'Aug', value: 85 },
  { month: 'Sep', value: 78 },
  { month: 'Oct', value: 92 },
  { month: 'Nov', value: 88 },
  { month: 'Dec', value: 95 },
];

const activities = [
  { icon: '✓', text: 'Payment received', sub: '₹42,000 · 2m ago', color: 'text-green-400' },
  { icon: '↗', text: 'Project deployed', sub: 'Nova Store · 1h ago', color: 'text-blue-400' },
  { icon: '+', text: 'New lead added', sub: 'Organic · 3h ago', color: 'text-purple-400' },
];

export function HeroDashboardMockup({ className }: { className?: string }) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning,'
      : currentHour < 16
      ? 'Good afternoon,'
      : currentHour < 20
      ? 'Good evening,'
      : 'Good night,';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={cn('relative', className)}
    >
      <div className="absolute -inset-4 rounded-3xl bg-purple-600/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl glow-purple">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-500/80" />
            <div className="size-3 rounded-full bg-yellow-500/80" />
            <div className="size-3 rounded-full bg-green-500/80" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-400">
            <span className="size-2 rounded-full bg-green-400" />
            app.digiayudh.com
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">OVERVIEW</p>
              <p className="text-sm font-semibold text-white">{greeting} Ayudh User 👋</p>
            </div>
            <button className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white">
              + New project
            </button>
          </div>

          {/* Metrics */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Revenue', value: '₹8.42L', change: '↗ 18.2%' },
              { label: 'Projects', value: '24', change: '↗ 4 new' },
              { label: 'Conversion', value: '32.8%', change: '↗ 6.4%' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-white/5 p-3">
                <p className="text-[10px] text-slate-400">{m.label}</p>
                <p className="text-sm font-bold text-white">{m.value}</p>
                <p className="text-[10px] text-green-400">{m.change}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mb-4 rounded-xl bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-white">Growth overview</p>
              <span className="text-[10px] text-slate-400">This year ⌄</span>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#purpleGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl bg-white/5 p-3">
            <p className="mb-2 text-xs font-medium text-white">Activity</p>
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.text} className="flex items-center gap-2">
                  <span className={cn('text-xs', a.color)}>{a.icon}</span>
                  <div>
                    <p className="text-[11px] text-white">{a.text}</p>
                    <p className="text-[10px] text-slate-500">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2">
            <div>
              <p className="text-xs font-medium text-green-400">You're live!</p>
              <p className="text-[10px] text-slate-400">Deployed successfully</p>
            </div>
            <span className="text-sm font-bold text-green-400">↗ +42%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
