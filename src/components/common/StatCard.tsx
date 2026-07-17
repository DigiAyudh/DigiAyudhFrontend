import { motion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { Card } from "../ui/card"
import { cn, formatCurrency } from "../../lib/utils"
import type { DashboardStat } from "../../types"

interface StatCardProps {
  stat: DashboardStat
  icon: LucideIcon
  index?: number
  accent?: string
}

export function StatCard({ stat, icon: Icon, index = 0, accent = "text-primary bg-primary/10" }: StatCardProps) {
  const formatted =
    stat.format === "currency"
      ? formatCurrency(stat.value)
      : stat.format === "percent"
      ? `${stat.value}%`
      : stat.value.toLocaleString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatted}</p>
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accent)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              stat.trend === "up" ? "text-success" : "text-destructive"
            )}
          >
            {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(stat.change)}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </Card>
    </motion.div>
  )
}
