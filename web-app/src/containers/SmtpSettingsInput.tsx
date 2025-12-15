import { useState, useEffect } from 'react'
import { Save, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSmtpSettings, saveSmtpSettings, SmtpSettings } from '@/services/smtpSettings'
import { useSalesboxAuth } from '@/hooks/useSalesboxAuth'

const SMTP_SECURE_OPTIONS = [
  { value: 'No', label: 'None' },
  { value: 'TLS', label: 'TLS' },
  { value: 'SSL', label: 'SSL' },
]

export function SmtpSettingsInput() {
  const { isAuthenticated } = useSalesboxAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const [settings, setSettings] = useState<SmtpSettings>({
    appSmtpHost: '',
    appSmtpPort: 25,
    appSmtpUser: '',
    appSmtpPass: '',
    appSmtpSecure: 'No',
  })

  // Fetch current settings on mount
  useEffect(() => {
    async function fetchSettings() {
      if (!isAuthenticated) {
        setIsFetching(false)
        return
      }

      try {
        const response = await getSmtpSettings()
        setSettings({
          appSmtpHost: response.appSmtpHost || '',
          appSmtpPort: response.appSmtpPort || 25,
          appSmtpUser: response.appSmtpUser || '',
          appSmtpPass: response.appSmtpPass || '',
          appSmtpSecure: response.appSmtpSecure || 'No',
        })
      } catch {
        // Silently fail - user will see empty form
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [isAuthenticated])

  const handleSave = async () => {
    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      await saveSmtpSettings({
        appSmtpHost: settings.appSmtpHost || null,
        appSmtpPort: settings.appSmtpPort,
        appSmtpUser: settings.appSmtpUser || null,
        appSmtpPass: settings.appSmtpPass || null,
        appSmtpSecure: settings.appSmtpSecure,
      })

      setStatus('success')
      setMessage('SMTP settings saved successfully')
      // Clear message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error ? error.message : 'Failed to save SMTP settings'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-sm text-main-view-fg/70">
        Please sign in to configure SMTP settings
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className="text-sm text-main-view-fg/70">
        Loading SMTP settings...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full mt-2">
      {/* Row 1: Host and Port */}
      <div className="grid grid-cols-[1fr_120px] gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-main-view-fg/70">SMTP Host</label>
          <Input
            type="text"
            value={settings.appSmtpHost || ''}
            onChange={(e) => setSettings({ ...settings, appSmtpHost: e.target.value })}
            className="w-full text-sm"
            placeholder="smtp.example.com"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-main-view-fg/70">Port</label>
          <Input
            type="number"
            value={settings.appSmtpPort}
            onChange={(e) =>
              setSettings({ ...settings, appSmtpPort: parseInt(e.target.value) || 25 })
            }
            className="w-full text-sm"
            placeholder="25"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Row 2: Username and Password */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-main-view-fg/70">Username</label>
          <Input
            type="text"
            value={settings.appSmtpUser || ''}
            onChange={(e) => setSettings({ ...settings, appSmtpUser: e.target.value })}
            className="w-full text-sm"
            placeholder="user@example.com"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-main-view-fg/70">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={settings.appSmtpPass || ''}
              onChange={(e) => setSettings({ ...settings, appSmtpPass: e.target.value })}
              className="w-full text-sm pr-10"
              placeholder="Enter password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-main-view-fg/50 hover:text-main-view-fg/80"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Security and Save */}
      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-main-view-fg/70">Security</label>
          <Select
            value={settings.appSmtpSecure}
            onValueChange={(value) =>
              setSettings({ ...settings, appSmtpSecure: value as SmtpSettings['appSmtpSecure'] })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select security type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-800 border border-main-view-fg/20">
              {SMTP_SECURE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full justify-center gap-2"
        >
          <Save size={16} />
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Status Message */}
      {status !== 'idle' && message && (
        <div
          className={`flex items-center gap-2 text-sm ${
            status === 'success' ? 'text-green-600' : 'text-destructive'
          }`}
        >
          {status === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
