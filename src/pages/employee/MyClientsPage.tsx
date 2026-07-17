import { useEffect } from 'react'
import { Mail, Phone, Building2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchClients } from '../../redux/slices/clientsSlice'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import { getInitials } from '../../utils/helpers'

export default function MyClientsPage() {
  const dispatch = useAppDispatch()
  const { clients, loading } = useAppSelector((s) => s.clients)
  const { user } = useAppSelector((s) => s.auth)

  useEffect(() => {
    dispatch(fetchClients())
  }, [dispatch])

  const mine = clients.filter((c) => c.verificationStatus === 'verified' && (!c.assignedEmployeeId || c.assignedEmployeeId === user?._id))

  return (
    <div className="space-y-6">
      <PageHeader title="My Clients" subtitle="Clients assigned to you." />

      {loading && clients.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : mine.length === 0 ? (
        <EmptyState icon={<Building2 className="h-6 w-6" />} title="No clients assigned" description="Verified clients assigned to you will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((c) => (
            <Card key={c._id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{getInitials(c.name)}</AvatarFallback></Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className="truncate text-xs text-text-light">{c.companyName || 'Individual'}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-text-light">
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <span className="truncate">{c.email}</span></p>
                  {c.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {c.phone}</p>}
                </div>
                <StatusBadge status="verified" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
