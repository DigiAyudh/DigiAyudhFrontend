import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import apiClient, { ClientSignupData, UserRole } from '../../services/api'
import { User } from '../../types'
import { tokenManager } from '@/utils/tokenManager'

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password, expectedRole }: { email: string; password: string; expectedRole: UserRole },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.login(email, password, expectedRole)
      tokenManager.setToken(response.data.token)
      tokenManager.setRefreshToken(response.data.refreshToken)
      return response.data
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const clientSignup = createAsyncThunk(
  'auth/clientSignup',
  async (data: ClientSignupData, { rejectWithValue }) => {
    try {
      const response = await apiClient.clientSignup(data)
      tokenManager.setToken(response.data.token)
      tokenManager.setRefreshToken(response.data.refreshToken)
      return response.data
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)









export const sendEmailOtp = createAsyncThunk(
  "auth/sendEmailOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.sendEmailOtp(email)
      return response.data
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)
export const verifyEmailOtp = createAsyncThunk(
  "auth/verifyEmailOtp",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.verifyEmailOtp(email, otp)
      return response.data
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)
export const resendEmailOtp = createAsyncThunk(
  "auth/resendEmailOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.resendEmailOtp(email)
      return response.data
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)










export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenManager.getToken()
      if (!token) {
        return rejectWithValue('No token')
      }
      const response = await apiClient.getMe()
      return response.data.user
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProfile(data)
      return response.data.user || response.data
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await apiClient.logout()
  } catch {
    // Clear local session even if server call fails
  }
  tokenManager.clearTokens()
  return null
})

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  initializing: boolean
  error: string | null
  isAuthenticated: boolean
}

const persistedUser = tokenManager.getUser() as User | null
const hasStoredSession = !!tokenManager.getToken() && tokenManager.isSessionValid()

const initialState: AuthState = {
  user: persistedUser,
  token: tokenManager.getToken(),
  loading: false,
  initializing: hasStoredSession,
  error: null,
  isAuthenticated: hasStoredSession,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.initializing = false
        tokenManager.setUser(action.payload.user)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(clientSignup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clientSignup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.initializing = false
        tokenManager.setUser(action.payload.user)
      })
      .addCase(clientSignup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.initializing = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.initializing = false
        state.user = action.payload
        state.isAuthenticated = true
        tokenManager.setUser(action.payload)
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.initializing = false
        if (!state.token || !tokenManager.isSessionValid()) {
          state.user = null
          state.isAuthenticated = false
        } else {
          state.isAuthenticated = true
          state.user = state.user || (tokenManager.getUser() as User | null)
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
        state.initializing = false
        tokenManager.clearTokens()
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
