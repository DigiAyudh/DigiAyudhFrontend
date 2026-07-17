import toast from 'react-hot-toast'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { updateSettings } from '../../redux/slices/settingsSlice'
import { useTheme } from '../../lib/theme'
import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Switch } from '../../components/ui/switch'
import { cn } from '../../lib/utils'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((s) => s.settings)
  const { theme, setTheme } = useTheme()

  const toggle = (key: keyof typeof settings) => {
    dispatch(updateSettings({ [key]: !settings[key] }))
    toast.success('Preference saved')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Customize your experience." />

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Theme</p>
            <div className="grid max-w-md grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors',
                    theme === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-light hover:border-primary/50'
                  )}
                >
                  <t.icon className="h-5 w-5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border">
          {[
            { key: 'emailNotifications' as const, label: 'Email notifications', desc: 'Receive updates via email' },
            { key: 'pushNotifications' as const, label: 'Push notifications', desc: 'Get real-time alerts in-app' },
            { key: 'weeklyDigest' as const, label: 'Weekly digest', desc: 'A summary of activity every week' },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-text-light">{row.desc}</p>
              </div>
              <Switch checked={settings[row.key]} onCheckedChange={() => toggle(row.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
