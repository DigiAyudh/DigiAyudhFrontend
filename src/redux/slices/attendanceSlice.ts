import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'

export interface Attendance {
  _id: string
  employeeId: string
  employeeName: string
  date: string
  status: 'present' | 'absent' | 'leave'
  checkInTime?: string
  checkOutTime?: string
}

export interface LeaveRequest {
  _id: string
  employeeId: string
  employeeName: string
  startDate: string
  endDate: string
  reason: string
  leaveType: 'sick' | 'personal' | 'vacation' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedBy?: string
  rejectionReason?: string
}

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async ({ company, date }: { company: string; date?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.getAttendance(company, date)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (data: { employeeId: string; date: string; status: 'present' | 'absent'; checkInTime?: string; checkOutTime?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.markAttendance(data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchLeaveRequests = createAsyncThunk(
  'attendance/fetchLeaveRequests',
  async (company: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getLeaveRequests(company)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const createLeaveRequest = createAsyncThunk(
  'attendance/createLeaveRequest',
  async (data: Omit<LeaveRequest, '_id' | 'status' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.createLeaveRequest(data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const approveLeaveRequest = createAsyncThunk(
  'attendance/approveLeaveRequest',
  async ({ id, approvedBy }: { id: string; approvedBy: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.approveLeaveRequest(id, approvedBy)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const rejectLeaveRequest = createAsyncThunk(
  'attendance/rejectLeaveRequest',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.rejectLeaveRequest(id, reason)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

interface AttendanceState {
  attendance: Attendance[]
  leaveRequests: LeaveRequest[]
  loading: boolean
  error: string | null
}

const initialState: AttendanceState = {
  attendance: [],
  leaveRequests: [],
  loading: false,
  error: null,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false
        state.attendance = action.payload
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Mark Attendance
      .addCase(markAttendance.fulfilled, (state, action) => {
        const index = state.attendance.findIndex((a) => a._id === action.payload._id)
        if (index !== -1) {
          state.attendance[index] = action.payload
        } else {
          state.attendance.push(action.payload)
        }
      })
      // Fetch Leave Requests
      .addCase(fetchLeaveRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
        state.loading = false
        state.leaveRequests = action.payload
      })
      .addCase(fetchLeaveRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create Leave Request
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.leaveRequests.push(action.payload)
      })
      // Approve Leave Request
      .addCase(approveLeaveRequest.fulfilled, (state, action) => {
        const index = state.leaveRequests.findIndex((l) => l._id === action.payload._id)
        if (index !== -1) {
          state.leaveRequests[index] = action.payload
        }
      })
      // Reject Leave Request
      .addCase(rejectLeaveRequest.fulfilled, (state, action) => {
        const index = state.leaveRequests.findIndex((l) => l._id === action.payload._id)
        if (index !== -1) {
          state.leaveRequests[index] = action.payload
        }
      })
  },
})

export default attendanceSlice.reducer
