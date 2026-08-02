import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { Invoice, Meeting, DocumentFile, AuditLog, Attendance } from '../../types'

/**
 * Safely extract an array from various backend response shapes.
 * Handles: plain array, { data: [...] }, { invoices: [...] }, { data: { invoices: [...] } }, etc.
 * Falls back to [] so Redux state never becomes `undefined` (which crashes [...state] iterators).
 */
function extractArray<T>(value: unknown, key?: string): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    // { data: [...] }
    if (Array.isArray(obj.data)) return obj.data as T[]
    // { data: { key: [...] } }
    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>
      if (Array.isArray(nested[key ?? ''] ?? nested.data)) {
        return (nested[key ?? ''] ?? nested.data) as T[]
      }
    }
    // { key: [...] } or { meetings: [...] }
    if (key && Array.isArray(obj[key])) return obj[key] as T[]
    // { invoices: [...] } / { documents: [...] } / { auditLogs: [...] } / { attendance: [...] }
    const aliases = ['invoices', 'meetings', 'documents', 'auditLogs', 'attendance']
    for (const alias of aliases) {
      if (Array.isArray(obj[alias])) return obj[alias] as T[]
    }
    // { list: [...] }
    if (Array.isArray(obj.list)) return obj.list as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
    if (Array.isArray(obj.results)) return obj.results as T[]
    if (Array.isArray(obj.rows)) return obj.rows as T[]
  }
  return [] as T[]
}

/**
 * Safely extract a single created/updated item from various backend response shapes.
 * Handles: item directly, { data: item }, { data: { meeting: item } }, { meeting: item }, etc.
 * Returns null if a valid item (with _id) cannot be found.
 */
function extractItem<T>(value: unknown, key?: string): T | null {
  const hasId = (v: unknown): boolean =>
    !!v && typeof v === 'object' && !Array.isArray(v) && (v as Record<string, unknown>)._id !== undefined

  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const obj = value as Record<string, unknown>
  if (hasId(obj)) return obj as T

  const dataVal = obj.data
  if (hasId(dataVal)) return dataVal as T

  if (dataVal && typeof dataVal === 'object' && !Array.isArray(dataVal)) {
    const nested = dataVal as Record<string, unknown>
    if (key && hasId(nested[key])) return nested[key] as T
    if (hasId(nested.data)) return nested.data as T
  }

  if (key && hasId(obj[key])) return obj[key] as T

  const aliases = ['meeting', 'invoice', 'document', 'auditLog', 'record', 'item']
  for (const alias of aliases) {
    if (hasId(obj[alias])) return obj[alias] as T
  }

  return null
}

export const fetchInvoices = createAsyncThunk('business/invoices', async (clientId: string | undefined, { rejectWithValue }) => {
  try {
    const res = await apiClient.getInvoices(clientId)
    return extractArray<Invoice>(res.data, 'invoices')
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const updateInvoice = createAsyncThunk(
  'business/updateInvoice',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.updateInvoice(id, data)
      return res.data.data as Invoice
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const fetchMeetings = createAsyncThunk('business/meetings', async (clientId: string | undefined, { rejectWithValue }) => {
  try {
    const res = await apiClient.getMeetings(clientId)
    return extractArray<Meeting>(res.data, 'meetings')
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const createMeeting = createAsyncThunk('business/createMeeting', async (data: Record<string, unknown>, { rejectWithValue }) => {
  try {
    const res = await apiClient.createMeeting(data)
    return extractItem<Meeting>(res.data, 'meeting')
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const updateMeeting = createAsyncThunk(
  'business/updateMeeting',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.updateMeeting(id, data)
      return extractItem<Meeting>(res.data, 'meeting')
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const deleteMeeting = createAsyncThunk(
  'business/deleteMeeting',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteMeeting(id)
      return id
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const fetchDocuments = createAsyncThunk('business/documents', async (ownerId: string | undefined, { rejectWithValue }) => {
  try {
    const res = await apiClient.getDocuments(ownerId)
    return extractArray<DocumentFile>(res.data, 'documents')
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const fetchAuditLogs = createAsyncThunk('business/audit', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.getAuditLogs()
    return extractArray<AuditLog>(res.data, 'auditLogs')
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const fetchAttendance = createAsyncThunk('business/attendance', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.getAttendance('digiayudh')
    return extractArray<Attendance>(res.data, 'attendance')
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

interface BusinessState {
  invoices: Invoice[]
  meetings: Meeting[]
  documents: DocumentFile[]
  auditLogs: AuditLog[]
  attendance: Attendance[]
  loading: boolean
  error: string | null
}

const initialState: BusinessState = {
  invoices: [],
  meetings: [],
  documents: [],
  auditLogs: [],
  attendance: [],
  loading: false,
  error: null,
}

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const idx = state.invoices.findIndex((i) => i._id === action.payload._id)
        if (idx !== -1) state.invoices[idx] = action.payload
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.meetings = action.payload
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        if (!action.payload) return
        if (!Array.isArray(state.meetings)) state.meetings = []
        state.meetings.unshift(action.payload)
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        if (!action.payload) return
        if (!Array.isArray(state.meetings)) state.meetings = []
        const idx = state.meetings.findIndex((m) => m._id === action.payload._id)
        if (idx !== -1) state.meetings[idx] = action.payload
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        if (!Array.isArray(state.meetings)) state.meetings = []
        state.meetings = state.meetings.filter((m) => m._id !== action.payload)
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.attendance = action.payload
      })
  },
})

export default businessSlice.reducer