import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { ContactRequest } from '../../types'

export const submitContactRequest = createAsyncThunk(
  'contact/submit',
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const res = await apiClient.createContactRequest(data)
      return res.data.data as ContactRequest
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const fetchContactRequests = createAsyncThunk('contact/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.getContactRequests()
    return res.data.data as ContactRequest[]
  } catch (error) {
    return rejectWithValue(apiClient.getErrorMessage(error))
  }
})

export const updateContactRequest = createAsyncThunk(
  'contact/update',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.updateContactRequest(id, data)
      return res.data.data as ContactRequest
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

interface ContactState {
  requests: ContactRequest[]
  loading: boolean
  submitting: boolean
  error: string | null
}

const initialState: ContactState = { requests: [], loading: false, submitting: false, error: null }

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitContactRequest.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitContactRequest.fulfilled, (state, action) => {
        state.submitting = false
        state.requests.unshift(action.payload)
      })
      .addCase(submitContactRequest.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
      .addCase(fetchContactRequests.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchContactRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload
      })
      .addCase(updateContactRequest.fulfilled, (state, action) => {
        const idx = state.requests.findIndex((r) => r._id === action.payload._id)
        if (idx !== -1) state.requests[idx] = action.payload
      })
  },
})

export default contactSlice.reducer
