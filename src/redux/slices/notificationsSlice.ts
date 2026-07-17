import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import { Notification } from '../../types'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.getNotifications(userId ?? '')
      return response.data.data as Notification[]
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.markNotificationAsRead(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      await apiClient.markAllNotificationsRead(userId ?? '')
      return true
    } catch (error) {
      return rejectWithValue(apiClient.getErrorMessage(error))
    }
  }
)

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
        state.unreadCount = action.payload.filter((n) => !n.isRead).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload)
        if (notification && !notification.isRead) {
          notification.isRead = true
          state.unreadCount -= 1
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n: Notification) => {
          n.isRead = true
        })
        state.unreadCount = 0
      })
  },
})

export const { addNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
