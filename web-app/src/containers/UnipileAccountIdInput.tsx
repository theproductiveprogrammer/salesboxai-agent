import { useState, useEffect } from 'react'
import { Save, CheckCircle, XCircle, Linkedin, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { setUnipileAccountId, getUnipileAuthLink, getUnipileAccountId } from '@/services/unipile'
import { useSalesboxAuth } from '@/hooks/useSalesboxAuth'
import { openUrl } from '@tauri-apps/plugin-opener'

export function UnipileAccountIdInput() {
  const { isAuthenticated } = useSalesboxAuth()
  const [accountId, setAccountId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  // Check existing connection status on mount
  useEffect(() => {
    async function checkConnectionStatus() {
      if (!isAuthenticated) {
        setIsCheckingStatus(false)
        return
      }

      try {
        const response = await getUnipileAccountId()
        if (response.success && response.accountId) {
          setIsConnected(true)
          setConnectedAccountId(response.accountId)
        }
      } catch {
        // Silently fail - user just won't see connected state
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkConnectionStatus()
  }, [isAuthenticated])

  // Check URL params for success/failure from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const linkedinStatus = params.get('linkedin')

    if (linkedinStatus === 'success') {
      setStatus('success')
      setMessage('LinkedIn account connected successfully!')
      setIsConnected(true)
      // Refetch to get the account ID
      getUnipileAccountId().then(response => {
        if (response.success && response.accountId) {
          setConnectedAccountId(response.accountId)
        }
      }).catch(() => {})
      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('linkedin')
      window.history.replaceState({}, '', url.toString())

      // Clear message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } else if (linkedinStatus === 'failed') {
      setStatus('error')
      setMessage('Failed to connect LinkedIn account. Please try again.')
      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('linkedin')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await getUnipileAuthLink()

      if (response.success && response.url) {
        // Open in system browser (Unipile requires this - no iframe)
        await openUrl(response.url)
        setStatus('success')
        setMessage('Opening LinkedIn authentication in browser...')
      } else {
        setStatus('error')
        setMessage(response.error || 'Failed to generate authentication link')
      }
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error ? error.message : 'Failed to connect to LinkedIn'
      )
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSave = async () => {
    if (!accountId.trim()) {
      setStatus('error')
      setMessage('Please enter a LinkedIn Account ID')
      return
    }

    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await setUnipileAccountId(accountId.trim())

      if (response.success) {
        setStatus('success')
        setMessage(response.message || 'Account ID saved successfully')
        setIsConnected(true)
        setConnectedAccountId(accountId.trim())
        // Clear input after successful save
        setTimeout(() => {
          setAccountId('')
          setStatus('idle')
          setMessage('')
          setShowManualInput(false)
        }, 3000)
      } else {
        setStatus('error')
        setMessage(response.error || 'Failed to save Account ID')
      }
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error ? error.message : 'Failed to save Account ID'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-sm text-main-view-fg/70">
        Please sign in to configure LinkedIn Account
      </div>
    )
  }

  if (isCheckingStatus) {
    return (
      <div className="text-sm text-main-view-fg/70">
        Checking connection status...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Connected Status */}
      {isConnected && (
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <CheckCircle size={16} />
          <span>LinkedIn account connected</span>
          {connectedAccountId && (
            <span className="text-main-view-fg/40 text-xs ml-auto">
              ID: {connectedAccountId.slice(0, 2)}...
            </span>
          )}
        </div>
      )}

      {/* Connect LinkedIn Button */}
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        variant={isConnected ? 'outline' : 'default'}
        className="w-full justify-center gap-2"
      >
        <Linkedin size={18} />
        {isConnecting ? 'Opening browser...' : isConnected ? 'Reconnect LinkedIn Account' : 'Connect LinkedIn Account'}
      </Button>

      {/* Manual Input Toggle */}
      <button
        onClick={() => setShowManualInput(!showManualInput)}
        className="flex items-center gap-1 text-xs text-main-view-fg/60 hover:text-main-view-fg/80 transition-colors"
      >
        {showManualInput ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>Or enter Account ID manually</span>
      </button>

      {/* Manual Input Section */}
      {showManualInput && (
        <div className="flex gap-2">
          <Input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="flex-1 text-sm"
            placeholder="Enter your LinkedIn Account ID"
            disabled={isLoading}
          />
          <Button
            onClick={handleSave}
            size="sm"
            disabled={isLoading || !accountId.trim()}
          >
            <Save size={16} />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}

      {/* Status Message */}
      {status !== 'idle' && message && (
        <div
          className={`flex items-center gap-2 text-sm ${
            status === 'success' ? 'text-green-600' : 'text-destructive'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle size={14} />
          ) : (
            <XCircle size={14} />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
