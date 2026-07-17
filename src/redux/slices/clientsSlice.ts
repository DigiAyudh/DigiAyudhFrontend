import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { User } from '../../types'

export const fetchClients = createAsyncThunk('clients/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.getClients()
    return res.data.data as User[]
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const verifyClient = createAsyncThunk('clients/verify', async (clientId: string, { rejectWithValue }) => {
  try {
    const res = await apiClient.verifyClient(clientId)
    return res.data.data as User
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const rejectClient = createAsyncThunk(
  'clients/reject',
  async ({ clientId, reason }: { clientId: string; reason: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.rejectClient(clientId, reason)
      return res.data.data as User
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
  if (idx !== -1) state.clients[idx] = user
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
