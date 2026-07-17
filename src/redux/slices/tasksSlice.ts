import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import { Task } from '../../types'

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (arg: { company?: string; projectId?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.getTasks(arg?.company ?? 'digiayudh', arg?.projectId)
      return response.data.data as Task[]
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.createTask(data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateTask(id, data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
  },
})

export default tasksSlice.reducer
