import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectsReducer from './slices/projectsSlice'
import tasksReducer from './slices/tasksSlice'
import employeesReducer from './slices/employeesSlice'
import leadsReducer from './slices/leadsSlice'
import chatsReducer from './slices/chatsSlice'
import notificationsReducer from './slices/notificationsSlice'
import clientsReducer from './slices/clientsSlice'
import contactReducer from './slices/contactSlice'
import dashboardReducer from './slices/dashboardSlice'
import businessReducer from './slices/businessSlice'
import supportReducer from './slices/supportSlice'
import settingsReducer from './slices/settingsSlice'
import attendanceReducer from './slices/attendanceSlice'
import todoReducer from './slices/todoSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    employees: employeesReducer,
    leads: leadsReducer,
    chats: chatsReducer,
    notifications: notificationsReducer,
    clients: clientsReducer,
    contact: contactReducer,
    dashboard: dashboardReducer,
    business: businessReducer,
    support: supportReducer,
    settings: settingsReducer,
    attendance: attendanceReducer,
    todos: todoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
