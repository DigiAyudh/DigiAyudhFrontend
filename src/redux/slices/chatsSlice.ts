import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import apiClient from '../../services/api'
import { Chat, Message } from '../../types'

export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async ({ company, userId }: { company: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.getChats(company, userId)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'chats/fetchMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getMessages(chatId)
      return { chatId, messages: response.data.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

interface ChatsState {
  chats: Chat[]
  messages: Record<string, Message[]>
  loading: boolean
  error: string | null
  activeChat: string | null
}

const initialState: ChatsState = {
  chats: [],
  messages: {},
  loading: false,
  error: null,
  activeChat: null,
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      if (!state.messages[action.payload.chatId]) {
        state.messages[action.payload.chatId] = []
      }
      state.messages[action.payload.chatId].push(action.payload.message)
    },
    setActiveChat: (state, action: PayloadAction<string>) => {
      state.activeChat = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false
        state.chats = action.payload
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.chatId] = action.payload.messages
      })
  },
})

export const { addMessage, setActiveChat } = chatsSlice.actions
export default chatsSlice.reducer
