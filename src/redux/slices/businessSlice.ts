import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { Invoice, Meeting, DocumentFile, AuditLog, Attendance } from '../../types'

export const fetchInvoices = createAsyncThunk('business/invoices', async (clientId: string | undefined, { rejectWithValue }) => {
  try {
    const res = await apiClient.getInvoices(clientId)
    return res.data.data as Invoice[]
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
    return res.data.data as Meeting[]
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const createMeeting = createAsyncThunk('business/createMeeting', async (data: Record<string, unknown>, { rejectWithValue }) => {
  try {
    const res = await apiClient.createMeeting(data)
    return res.data.data as Meeting
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const fetchDocuments = createAsyncThunk('business/documents', async (ownerId: string | undefined, { rejectWithValue }) => {
  try {
    const res = await apiClient.getDocuments(ownerId)
    return res.data.data as DocumentFile[]
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const fetchAuditLogs = createAsyncThunk('business/audit', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.getAuditLogs()
    return res.data.data as AuditLog[]
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const fetchAttendance = createAsyncThunk('business/attendance', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.getAttendance()
    return res.data.data as Attendance[]
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
        state.meetings.unshift(action.payload)
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
