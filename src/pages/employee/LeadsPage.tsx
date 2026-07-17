import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchLeads } from '../../redux/slices/leadsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency } from '../../lib/utils'
import type { Lead } from '../../types'

export default function LeadsPage() {
  const dispatch = useAppDispatch()
  const { leads, loading } = useAppSelector((s) => s.leads)

  useEffect(() => {
    dispatch(fetchLeads(undefined))
  }, [dispatch])

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" subtitle="Sales pipeline and prospective clients." />
      <DataTable<Lead>
        data={leads}
        loading={loading}
        searchKeys={['name', 'email', 'company']}
        searchPlaceholder="Search leads..."
        exportFileName="leads"
        columns={[
          { header: 'Name', accessor: 'name', sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
          { header: 'Company', accessor: 'company', sortable: true },
          { header: 'Email', accessor: 'email' },
          { header: 'Source', accessor: 'source' },
          { header: 'Budget', accessor: 'budget', sortable: true, cell: (r) => (r.budget ? formatCurrency(r.budget) : '—') },
          { header: 'Status', accessor: 'status', cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  )
}
