import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import apiClient from '../../services/api'
import type { User } from '../../types'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import { getInitials, formatDate } from '../../lib/utils'

export default function AdminsPage() {
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiClient
      .getUsers('digiayudh')
      .then((res) => {
        if (!active) return
        const list = (res.data.data as User[]).filter((u) => u.role === 'admin')
        setAdmins(list)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const columns: Column<User>[] = [
    {
      header: 'Administrator',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(row.name)}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: () => <Badge variant="default"><ShieldCheck className="h-3 w-3 mr-1" /> Admin</Badge>,
    },
    { header: 'Phone', accessor: 'phone', cell: (row) => row.phone || '—' },
    { header: 'Member Since', accessor: 'createdAt', cell: (row) => formatDate(row.createdAt) },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'outline'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Administrators" subtitle="Team members with full system access." />
      <DataTable
        columns={columns}
        data={admins}
        loading={loading}
        searchPlaceholder="Search admins..."
        searchKeys={['name', 'email']}
        exportFileName="admins"
      />
    </div>
  )
}
