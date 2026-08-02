import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** Alias for description */
  subtitle?: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, subtitle, actions, children, className }: PageHeaderProps) {
  const sub = description ?? subtitle
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground text-pretty">{sub}</p>}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2">{actions}{children}</div>
      )}
    </motion.div>
  )
}
