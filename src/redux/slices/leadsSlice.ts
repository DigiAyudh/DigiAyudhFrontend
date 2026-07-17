import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import { Lead } from '../../types'

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (company: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.getLeads(company ?? 'digiayudh')
      return response.data.data as Lead[]
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.createLead(data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateLead(id, data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

interface LeadsState {
  leads: Lead[]
  loading: boolean
  error: string | null
}

const initialState: LeadsState = {
  leads: [],
  loading: false,
  error: null,
}

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false
        state.leads = action.payload
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.push(action.payload)
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l._id === action.payload._id)
        if (index !== -1) {
          state.leads[index] = action.payload
        }
      })
  },
})

export default leadsSlice.reducer
