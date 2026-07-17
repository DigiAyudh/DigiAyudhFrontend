import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AppSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
  compactMode: boolean
  accentColor: string
  language: string
  timezone: string
}

const STORAGE_KEY = 'digiayudh_settings'

const defaults: AppSettings = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: false,
  compactMode: false,
  accentColor: 'violet',
  language: 'en',
  timezone: 'Asia/Kolkata',
}

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return defaults
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: load(),
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      Object.assign(state, action.payload)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // ignore
      }
    },
  },
})

export const { updateSettings } = settingsSlice.actions
export default settingsSlice.reducer
