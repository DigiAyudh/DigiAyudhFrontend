import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { setUser } from '../redux/slices/authSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Save, Bell, Lock, Moon, Sun } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    twoFactor: false,
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    // API call to update profile
    if (user) {
      dispatch(setUser({ ...user, ...formData }))
    }
  }

  const handleSavePreferences = () => {
    localStorage.setItem('preferences', JSON.stringify(preferences))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text">Settings</h1>
          <p className="text-text-light mt-2">Manage your profile and preferences</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-text mb-6">Profile Information</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-text font-medium">{user?.name}</p>
                <p className="text-text-light text-sm">{user?.role}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              <Save size={20} />
              Save Profile
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-text">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-text font-medium">Email Notifications</p>
                <p className="text-text-light text-sm">Receive updates via email</p>
              </div>
              <label className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    setPreferences({ ...preferences, emailNotifications: e.target.checked })
                  }
                  className="sr-only"
                />
                <div
                  className={`block w-full h-full rounded-full transition ${
                    preferences.emailNotifications ? 'bg-primary' : 'bg-gray-300'
                  }`}
                ></div>
              </label>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-text font-medium">Push Notifications</p>
                  <p className="text-text-light text-sm">Get instant notifications</p>
                </div>
                <label className="relative inline-block w-10 h-6">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) =>
                      setPreferences({ ...preferences, pushNotifications: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block w-full h-full rounded-full transition ${
                      preferences.pushNotifications ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  ></div>
                </label>
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              <Save size={20} />
              Save Preferences
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sun size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-text">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-text font-medium">Dark Mode</p>
                <p className="text-text-light text-sm">Enable dark theme</p>
              </div>
              <label className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  checked={preferences.darkMode}
                  onChange={(e) =>
                    setPreferences({ ...preferences, darkMode: e.target.checked })
                  }
                  className="sr-only"
                />
                <div
                  className={`block w-full h-full rounded-full transition ${
                    preferences.darkMode ? 'bg-primary' : 'bg-gray-300'
                  }`}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-text">Security</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-text font-medium mb-2">Change Password</p>
              <button className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
                Change Password
              </button>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-text font-medium">Two-Factor Authentication</p>
                  <p className="text-text-light text-sm">Add an extra layer of security</p>
                </div>
                <label className="relative inline-block w-10 h-6">
                  <input
                    type="checkbox"
                    checked={preferences.twoFactor}
                    onChange={(e) =>
                      setPreferences({ ...preferences, twoFactor: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block w-full h-full rounded-full transition ${
                      preferences.twoFactor ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  ></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-text mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-light">Account Type:</span>
              <span className="text-text font-medium capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Join Date:</span>
              <span className="text-text font-medium">{new Date(user?.joinDate || '').toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Email:</span>
              <span className="text-text font-medium">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
