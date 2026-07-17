import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { SupportTicket } from '../../types'

export const fetchTickets = createAsyncThunk('support/fetch', async (createdBy: string | undefined, { rejectWithValue }) => {
  try {
    const res = await apiClient.getSupportTickets(createdBy)
    return res.data.data as SupportTicket[]
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const createTicket = createAsyncThunk('support/create', async (data: Record<string, unknown>, { rejectWithValue }) => {
  try {
    const res = await apiClient.createSupportTicket(data)
    return res.data.data as SupportTicket
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const replyTicket = createAsyncThunk(
  'support/reply',
  async ({ id, message }: { id: string; message: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.replySupportTicket(id, message)
      return res.data.data as SupportTicket
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const updateTicket = createAsyncThunk(
  'support/update',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.updateSupportTicket(id, data)
      return res.data.data as SupportTicket
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

interface SupportState {
  tickets: SupportTicket[]
  loading: boolean
  error: string | null
}

const initialState: SupportState = { tickets: [], loading: false, error: null }

function replace(state: SupportState, t: SupportTicket) {
  const idx = state.tickets.findIndex((x) => x._id === t._id)
  if (idx !== -1) state.tickets[idx] = t
}

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.tickets.unshift(action.payload)
      })
      .addCase(replyTicket.fulfilled, (state, action) => replace(state, action.payload))
      .addCase(updateTicket.fulfilled, (state, action) => replace(state, action.payload))
  },
})

export default supportSlice.reducer
