import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import { Employee, User } from '../../types'

// Normalize API response to Employee type - API may return User objects
function normalizeEmployee(data: unknown): Employee {
  const item = data as Partial<User> & Record<string, unknown>
  const getDate = (val: unknown): Date => {
    if (!val) return new Date()
    if (val instanceof Date) return val
    if (typeof val === 'string' || typeof val === 'number') return new Date(val)
    return new Date()
  }
  return {
    _id: String(item._id || item.userId || ''),
    userId: String(item.userId || item._id || ''),
    name: String(item.name || ''),
    email: String(item.email || ''),
    position: String(item.position || ''),
    department: String(item.department || ''),
    salary: item.salary as number | undefined,
    joiningDate: getDate(item.joiningDate),
    phone: String(item.phone || ''),
    address: String(item.address || ''),
    city: String(item.city || ''),
    country: String(item.country || ''),
    emergencyContact: item.emergencyContact ? String(item.emergencyContact) : undefined,
    emergencyPhone: item.emergencyPhone ? String(item.emergencyPhone) : undefined,
    isActive: Boolean(item.isActive ?? true),
    company: String(item.company || 'digiayudh'),
    createdAt: getDate(item.createdAt),
    updatedAt: getDate(item.updatedAt),
  }
}

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (company: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getEmployees(company)
      const payload = response.data?.data ?? response.data?.employees ?? response.data
      
      if (Array.isArray(payload)) {
        return payload.map(normalizeEmployee)
      }
      
      return [] as Employee[]
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
      return normalizeEmployee(response.data.data)
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
      return normalizeEmployee(response.data.data)
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
