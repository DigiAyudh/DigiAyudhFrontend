import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchTasks, updateTask } from '../../redux/slices/tasksSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { formatDate } from '../../lib/utils'
import type { Task } from '../../types'

const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'completed', label: 'Completed' },
]

const NEXT: Record<Task['status'], Task['status'] | null> = {
  todo: 'in-progress',
  'in-progress': 'review',
  review: 'completed',
  completed: null,
}

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'info'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'info',
}

export default function TaskBoard() {
  const dispatch = useAppDispatch()
  const { tasks, loading } = useAppSelector((s) => s.tasks)

  useEffect(() => {
    dispatch(fetchTasks(undefined))
  }, [dispatch])

  const advance = async (task: Task) => {
    const next = NEXT[task.status]
    if (!next) return
    await dispatch(updateTask({ id: task._id, data: { status: next } }))
    toast.success(`Moved "${task.title}" to ${next}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Task Board" subtitle="Track work across stages. Click a card to advance it." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key)
          return (
            <div key={col.key} className="flex flex-col rounded-xl bg-muted/50 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-light">{items.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {loading && tasks.length === 0
                  ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24" />)
                  : items.map((t) => (
                      <motion.button
                        key={t._id}
                        layout
                        onClick={() => advance(t)}
                        disabled={col.key === 'completed'}
                        className="group rounded-lg border border-border bg-surface p-3 text-left shadow-sm transition-colors hover:border-primary disabled:cursor-default disabled:hover:border-border"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{t.title}</p>
                          {col.key !== 'completed' && (
                            <ChevronRight className="h-4 w-4 shrink-0 text-text-light opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-text-light">{t.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant={PRIORITY_VARIANT[t.priority] || 'info'} className="capitalize">{t.priority}</Badge>
                          <span className="flex items-center gap-1 text-xs text-text-light">
                            <Clock className="h-3 w-3" /> {formatDate(t.dueDate)}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                {!loading && items.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-text-light">No tasks</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
