import { useEffect, useState } from 'react'
import { Coins, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchSportTokens, updateSportToken, createSportToken } from '../../redux/slices/sportSlice'
import { fetchClients } from '../../redux/slices/clientsSlice'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { formatDate } from '../../lib/utils'
import type { SportToken, User } from '../../types'

export default function SportTokensPage() {
  const dispatch = useAppDispatch()
  const { tokens, loading } = useAppSelector((s) => s.sport)
  const { clients } = useAppSelector((s) => s.clients)
  const { user } = useAppSelector((s) => s.auth)

  const [editing, setEditing] = useState<SportToken | null>(null)
  const [newBalance, setNewBalance] = useState<string>('0')
  const [grantOpen, setGrantOpen] = useState(false)
  const [grantClientId, setGrantClientId] = useState('')
  const [grantBalance, setGrantBalance] = useState('0')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchSportTokens(undefined))
    dispatch(fetchClients())
  }, [dispatch])

  const openEdit = (t: SportToken) => {
    setEditing(t)
    setNewBalance(String(t.balance))
  }

  const saveBalance = async () => {
    if (!editing) return
    const value = Number(newBalance)
    if (Number.isNaN(value) || value < 0) {
      toast.error('Enter a valid non-negative balance')
      return
    }
    setIsSaving(true)
    try {
      await dispatch(updateSportToken({ id: editing._id, data: { balance: value } })).unwrap()
      toast.success('Token balance updated')
      setEditing(null)
    } catch (error) {
      toast.error('Failed to update token balance')
    } finally {
      setIsSaving(false)
    }
  }

  const grantTokens = async () => {
    const value = Number(grantBalance)
    if (!grantClientId || Number.isNaN(value) || value <= 0) {
      toast.error('Select a client and enter a positive balance')
      return
    }
    setIsSaving(true)
    try {
      const existing = tokens.find((t) => t.clientId === grantClientId)
      if (existing) {
        await dispatch(
          updateSportToken({ id: existing._id, data: { balance: existing.balance + value } })
        ).unwrap()
        toast.success('Tokens granted')
      } else {
        const client = clients.find((c) => c._id === grantClientId)
        await dispatch(
          createSportToken({
            clientId: grantClientId,
            clientName: client?.name || 'Client',
            balance: value,
            totalGranted: value,
            used: 0,
          })
        ).unwrap()
        toast.success('Tokens granted to new client')
      }
      setGrantOpen(false)
      setGrantClientId('')
      setGrantBalance('0')
    } catch (error) {
      toast.error('Failed to grant tokens')
    } finally {
      setIsSaving(false)
    }
  }

  const columns: Column<SportToken>[] = [
    {
      header: 'Client',
      accessor: 'clientName',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.clientName}</p>
          <p className="text-xs text-muted-foreground">{row.clientId}</p>
        </div>
      ),
    },
    { header: 'Balance', accessor: 'balance', sortable: true },
    { header: 'Total Granted', accessor: 'totalGranted', sortable: true },
    { header: 'Used', accessor: 'used', sortable: true },
    { header: 'Updated', accessor: 'updatedAt', cell: (row) => formatDate(row.updatedAt), sortable: true },
    {
      header: 'Actions',
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
          Adjust
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Sport Tokens" subtitle="Administer client support token balances.">
        <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Grant Tokens
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Grant Sport Tokens</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select value={grantClientId} onValueChange={setGrantClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name} ({c.companyName || 'Individual'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Balance to grant</label>
                <Input
                  type="number"
                  min="1"
                  value={grantBalance}
                  onChange={(e) => setGrantBalance(e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantOpen(false)}>Cancel</Button>
              <Button onClick={grantTokens} disabled={isSaving}>
                {isSaving ? 'Granting...' : 'Grant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-light">Total Clients with Tokens</p>
            <p className="mt-1 text-2xl font-bold">{tokens.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-light">Total Balance</p>
            <p className="mt-1 text-2xl font-bold">{tokens.reduce((s, t) => s + t.balance, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-light">Total Used</p>
            <p className="mt-1 text-2xl font-bold">{tokens.reduce((s, t) => s + t.used, 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={tokens}
          loading={loading}
          searchPlaceholder="Search by client..."
          searchKeys={['clientName', 'clientId']}
          exportFileName="sport-tokens"
          emptyState={
            <EmptyState
              icon={<Coins className="h-6 w-6" />}
              title="No sport tokens"
              description="Grant tokens to clients to enable their support tickets."
            />
          }
        />
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Token Balance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-text-light">Client</p>
              <p className="font-medium">{editing?.clientName}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Balance</label>
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-text-light" />
                <Input
                  type="number"
                  min="0"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                />
                <Plus className="h-4 w-4 text-text-light" />
              </div>
            </div>
            <p className="text-xs text-text-light">
              Current balance: {editing?.balance ?? 0} · Used: {editing?.used ?? 0} · Granted: {editing?.totalGranted ?? 0}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveBalance} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

