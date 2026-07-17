import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import type { DashboardStat } from '../../types'

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetch',
  async (role: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.getDashboardStats(role)
      return res.data.data as DashboardStat[]
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

interface DashboardState {
  stats: DashboardStat[]
  loading: boolean
  error: string | null
}

const initialState: DashboardState = { stats: [], loading: false, error: null }

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default dashboardSlice.reducer
