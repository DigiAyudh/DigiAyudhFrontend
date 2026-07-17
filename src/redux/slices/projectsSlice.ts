import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import { Project } from '../../types'

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (company: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProjects(company ?? 'digiayudh')
      return response.data.data as Project[]
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.createProject(data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProject(id, data)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteProject(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex((p) => p._id === action.payload._id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload)
      })
  },
})

export default projectsSlice.reducer
