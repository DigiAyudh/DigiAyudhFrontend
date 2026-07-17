import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'

export interface ToDo {
  _id: string
  taskId: string
  employeeId: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export const fetchToDos = createAsyncThunk(
  'todos/fetchToDos',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getToDos(employeeId)
      return response.data.data as ToDo[]
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const createToDo = createAsyncThunk(
  'todos/createToDo',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.createToDo(data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateToDo = createAsyncThunk(
  'todos/updateToDo',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateToDo(id, data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const deleteToDo = createAsyncThunk(
  'todos/deleteToDo',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteToDo(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

interface ToDoState {
  todos: ToDo[]
  loading: boolean
  error: string | null
}

const initialState: ToDoState = {
  todos: [],
  loading: false,
  error: null,
}

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchToDos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchToDos.fulfilled, (state, action) => {
        state.loading = false
        state.todos = action.payload
      })
      .addCase(fetchToDos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createToDo.fulfilled, (state, action) => {
        state.todos.push(action.payload)
      })
      .addCase(updateToDo.fulfilled, (state, action) => {
        const index = state.todos.findIndex((t) => t._id === action.payload._id)
        if (index !== -1) {
          state.todos[index] = action.payload
        }
      })
      .addCase(deleteToDo.fulfilled, (state, action) => {
        state.todos = state.todos.filter((t) => t._id !== action.payload)
      })
  },
})

export default todoSlice.reducer
