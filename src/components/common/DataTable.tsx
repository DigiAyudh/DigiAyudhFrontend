import { useMemo, useState } from 'react'
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { cn } from '../../lib/utils'

export interface Column<T> {
  header: string
  /** key on the row used for sorting / default rendering */
  accessor?: keyof T
  /** custom cell renderer */
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchKeys?: (keyof T)[]
  searchPlaceholder?: string
  exportFileName?: string
  toolbar?: React.ReactNode
  emptyState?: React.ReactNode
  onRowClick?: (row: T) => void
  pageSize?: number
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchKeys,
  searchPlaceholder = 'Search...',
  exportFileName = 'export',
  toolbar,
  emptyState,
  onRowClick,
  pageSize = 8,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!query) return data
    const keys = searchKeys ?? (Object.keys(data[0] ?? {}) as (keyof T)[])
    return data.filter((row) =>
      keys.some((k) => String(row[k] ?? '').toLowerCase().includes(query.toLowerCase()))
    )
  }, [data, query, searchKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.ceil(sorted.length / pageSize)
  const current = page > pageCount - 1 ? 0 : page
  const rows = sorted.slice(current * pageSize, current * pageSize + pageSize)

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const exportCsv = () => {
    if (!sorted.length) return
    const keys = Object.keys(sorted[0]).filter((k) => typeof sorted[0][k] !== 'object')
    const header = keys.join(',')
    const body = sorted
      .map((row) => keys.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFileName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0) }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                {columns.map((col, i) => (
                  <th key={i} className={cn('px-4 py-3 text-left font-medium text-text-light', col.className)}>
                    {col.sortable && col.accessor ? (
                      <button
                        className="inline-flex items-center gap-1 hover:text-text"
                        onClick={() => toggleSort(col.accessor!)}
                      >
                        {col.header}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : rows.length ? (
                rows.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-border last:border-0 transition-colors hover:bg-muted/40',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col, j) => (
                      <td key={j} className={cn('px-4 py-3 text-text', col.className)}>
                        {col.cell ? col.cell(row) : col.accessor ? String(row[col.accessor] ?? '') : null}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    {emptyState ?? <span className="text-text-light">No results found.</span>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-light">
            Page {current + 1} of {pageCount} · {sorted.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={current === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={current >= pageCount - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
