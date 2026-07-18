import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { User } from '../../types'

export function normalizeClientVerificationStatus(client: Partial<User> & Record<string, unknown>): User['verificationStatus'] {
  const rawStatus = client.verificationStatus ?? client.status ?? (client.isVerified === true ? 'verified' : client.isVerified === false ? 'pending' : undefined)

  if (typeof rawStatus === 'string') {
    const normalized = rawStatus.toLowerCase().trim()

    if (['verified', 'approved', 'active', 'complete', 'done'].includes(normalized)) return 'verified'
    if (['rejected', 'declined', 'denied', 'failed', 'cancelled'].includes(normalized)) return 'rejected'
    if (['pending', 'waiting', 'review', 'in-review', 'in_review', 'submitted', 'needs-review'].includes(normalized)) return 'pending'
  }

  return 'pending'
}

function normalizeClient(client: User): User {
  return {
    ...client,
    verificationStatus: normalizeClientVerificationStatus(client as Partial<User> & Record<string, unknown>),
  }
}

export const fetchClients = createAsyncThunk(
  'clients/fetch',
  async (company: string | undefined, { rejectWithValue }) => {
    try {
      const res = await apiClient.getClients(company)
      const payload = res.data?.data ?? res.data?.users ?? res.data?.clients ?? res.data

      if (Array.isArray(payload)) {
        return (payload as User[]).map(normalizeClient)
      }

      if (payload && typeof payload === 'object' && Array.isArray((payload as { users?: unknown[] }).users)) {
        return ((payload as { users: User[] }).users).map(normalizeClient)
      }

      if (payload && typeof payload === 'object' && Array.isArray((payload as { clients?: unknown[] }).clients)) {
        return ((payload as { clients: User[] }).clients).map(normalizeClient)
      }

      return [] as User[]
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const verifyClient = createAsyncThunk('clients/verify', async (clientId: string, { rejectWithValue }) => {
  try {
    const res = await apiClient.verifyClient(clientId)
    return normalizeClient(res.data.data as User)
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const rejectClient = createAsyncThunk(
  'clients/reject',
  async ({ clientId, reason }: { clientId: string; reason: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.rejectClient(clientId, reason)
      return normalizeClient(res.data.data as User)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const assignClient = createAsyncThunk(
  'clients/assign',
  async ({ clientId, employeeId }: { clientId: string; employeeId: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.assignClientToEmployee(clientId, employeeId)
      return res.data.data as User
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

interface ClientsState {
  clients: User[]
  loading: boolean
  error: string | null
}

const initialState: ClientsState = { clients: [], loading: false, error: null }

function replace(state: ClientsState, user: User) {
  const idx = state.clients.findIndex((c) => c._id === user._id)
  if (idx !== -1) state.clients[idx] = normalizeClient(user)
}

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.clients = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(verifyClient.fulfilled, (state, action) => replace(state, action.payload))
      .addCase(rejectClient.fulfilled, (state, action) => replace(state, action.payload))
      .addCase(assignClient.fulfilled, (state, action) => replace(state, action.payload))
  },
})

export default clientsSlice.reducer
