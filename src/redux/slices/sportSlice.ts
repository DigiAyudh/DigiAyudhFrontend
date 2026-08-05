import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { SportTicket, SportToken } from '../../types'

function extractArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>
      if (Array.isArray(nested.data)) return nested.data as T[]
      if (Array.isArray(nested.tickets)) return nested.tickets as T[]
      if (Array.isArray(nested.tokens)) return nested.tokens as T[]
    }
    if (Array.isArray(obj.tickets)) return obj.tickets as T[]
    if (Array.isArray(obj.tokens)) return obj.tokens as T[]
    if (Array.isArray(obj.list)) return obj.list as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
    if (Array.isArray(obj.results)) return obj.results as T[]
  }
  return [] as T[]
}

function extractItem<T>(value: unknown): T | null {
  const hasId = (v: unknown): boolean =>
    !!v && typeof v === 'object' && !Array.isArray(v) && (v as Record<string, unknown>)._id !== undefined
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const obj = value as Record<string, unknown>
  if (hasId(obj)) return obj as T
  if (hasId(obj.data)) return obj.data as T
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    const nested = obj.data as Record<string, unknown>
    if (hasId(nested.ticket)) return nested.ticket as T
    if (hasId(nested.token)) return nested.token as T
    if (hasId(nested.data)) return nested.data as T
  }
  if (hasId(obj.ticket)) return obj.ticket as T
  if (hasId(obj.token)) return obj.token as T
  return null
}

// ---- Sport Tickets ----
export const fetchSportTickets = createAsyncThunk(
  'sport/fetchTickets',
  async (clientId: string | undefined, { rejectWithValue }) => {
    try {
      const res = await apiClient.getSportTickets(clientId)
      return extractArray<SportTicket>(res.data)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const createSportTicket = createAsyncThunk(
  'sport/createTicket',
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const res = await apiClient.createSportTicket(data)
      return extractItem<SportTicket>(res.data)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const replySportTicket = createAsyncThunk(
  'sport/replyTicket',
  async ({ id, message, screenshots }: { id: string; message: string; screenshots?: string[] }, { rejectWithValue }) => {
    try {
      const res = await apiClient.replySportTicket(id, message, screenshots)
      return extractItem<SportTicket>(res.data)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const updateSportTicket = createAsyncThunk(
  'sport/updateTicket',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.updateSportTicket(id, data)
      return extractItem<SportTicket>(res.data)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

// ---- Sport Tokens ----
export const fetchSportTokens = createAsyncThunk(
  'sport/fetchTokens',
  async (clientId: string | undefined, { rejectWithValue }) => {
    try {
      const res = await apiClient.getSportTokens(clientId)
      return extractArray<SportToken>(res.data)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const updateSportToken = createAsyncThunk(
  'sport/updateToken',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.updateSportToken(id, data)
      return extractItem<SportToken>(res.data)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const createSportToken = createAsyncThunk(
  'sport/createToken',
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const res = await apiClient.createSportToken(data)
      return extractItem<SportToken>(res.data)
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

interface SportState {
  tickets: SportTicket[]
  tokens: SportToken[]
  loading: boolean
  error: string | null
}

const initialState: SportState = {
  tickets: [],
  tokens: [],
  loading: false,
  error: null,
}

function replaceTicket(state: SportState, t: SportTicket | null) {
  if (!t) return
  if (!Array.isArray(state.tickets)) state.tickets = []
  const idx = state.tickets.findIndex((x) => x._id === t._id)
  if (idx !== -1) state.tickets[idx] = t
  else state.tickets.unshift(t)
}

function replaceToken(state: SportState, t: SportToken | null) {
  if (!t) return
  if (!Array.isArray(state.tokens)) state.tokens = []
  const idx = state.tokens.findIndex((x) => x._id === t._id)
  if (idx !== -1) state.tokens[idx] = t
  else state.tokens.unshift(t)
}

const sportSlice = createSlice({
  name: 'sport',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSportTickets.fulfilled, (state, action) => {
        state.tickets = action.payload
      })
      .addCase(createSportTicket.fulfilled, (state, action) => replaceTicket(state, action.payload))
      .addCase(replySportTicket.fulfilled, (state, action) => replaceTicket(state, action.payload))
      .addCase(updateSportTicket.fulfilled, (state, action) => replaceTicket(state, action.payload))
      .addCase(fetchSportTokens.fulfilled, (state, action) => {
        state.tokens = action.payload
      })
      .addCase(updateSportToken.fulfilled, (state, action) => replaceToken(state, action.payload))
      .addCase(createSportToken.fulfilled, (state, action) => replaceToken(state, action.payload))
  },
})

export default sportSlice.reducer
