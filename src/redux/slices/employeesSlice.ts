import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import { Employee } from '../../types'

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (company: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getEmployees(company)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.createEmployee(data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateEmployee(id, data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

interface EmployeesState {
  employees: Employee[]
  loading: boolean
  error: string | null
}

const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null,
}

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload)
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex((e) => e._id === action.payload._id)
        if (index !== -1) {
          state.employees[index] = action.payload
        }
      })
  },
})

export default employeesSlice.reducer
