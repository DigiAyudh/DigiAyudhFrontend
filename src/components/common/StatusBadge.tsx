import { Badge } from '@/components/ui/badge'

const MAP: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline'> = {
  // generic
  active: 'success',
  inactive: 'outline',
  verified: 'success',
  pending: 'warning',
  rejected: 'destructive',
  // projects / tasks
  completed: 'success',
  'in-progress': 'info',
  'in-review': 'info',
  planning: 'warning',
  'on-hold': 'warning',
  todo: 'outline',
  cancelled: 'destructive',
  overdue: 'destructive',
  // invoices
  paid: 'success',
  sent: 'info',
  draft: 'outline',
  // support / contact
  open: 'warning',
  resolved: 'success',
  closed: 'outline',
  new: 'info',
  responded: 'success',
  scheduled: 'info',
  // priority
  low: 'outline',
  medium: 'info',
  high: 'warning',
  urgent: 'destructive',
  // attendance
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  leave: 'info',
  remote: 'info',
}

export function StatusBadge({ status }: { status: string }) {
  const key = status?.toLowerCase?.() ?? ''
  const variant = MAP[key] ?? 'default'
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ') : '—'
  return <Badge variant={variant}>{label}</Badge>
}
