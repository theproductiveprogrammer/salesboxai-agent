import { useEffect, useRef } from 'react'
import { getTools } from '@/services/mcp'
import { MCPTool } from '@/types/completion'
import { listen } from '@tauri-apps/api/event'
import { SystemEvent } from '@/types/events'
import { useAppState } from './useAppState'

/**
 * Get retry delay based on attempt number.
 * Delays: 10s -> 15s -> 30s -> 30s -> ... (capped at 30s)
 */
function getRetryDelay(attempt: number): number {
  if (attempt === 0) return 10000  // 10s
  if (attempt === 1) return 15000  // 15s
  return 30000                      // 30s cap
}

export const useTools = () => {
  const { updateTools } = useAppState()
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const attemptRef = useRef(0)

  useEffect(() => {
    function clearRetryTimeout() {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }

    function fetchToolsWithRetry() {
      getTools().then((data: MCPTool[]) => {
        updateTools(data)

        if (data.length === 0) {
          // No tools available - schedule retry with backoff
          const delay = getRetryDelay(attemptRef.current)
          console.log(`[useTools] No tools available, retrying in ${delay / 1000}s (attempt ${attemptRef.current + 1})`)
          retryTimeoutRef.current = setTimeout(() => {
            attemptRef.current++
            fetchToolsWithRetry()
          }, delay)
        } else {
          // Tools loaded successfully - reset attempt counter
          console.log(`[useTools] Tools loaded: ${data.length} tools`)
          attemptRef.current = 0
          clearRetryTimeout()
        }
      }).catch((error) => {
        console.error('[useTools] Failed to fetch MCP tools:', error)
        // Also retry on error
        const delay = getRetryDelay(attemptRef.current)
        console.log(`[useTools] Retrying after error in ${delay / 1000}s (attempt ${attemptRef.current + 1})`)
        retryTimeoutRef.current = setTimeout(() => {
          attemptRef.current++
          fetchToolsWithRetry()
        }, delay)
      })
    }

    // Initial fetch
    fetchToolsWithRetry()

    // Listen for MCP_UPDATE events (e.g., after server restart)
    let unsubscribe = () => {}
    listen(SystemEvent.MCP_UPDATE, () => {
      console.log('[useTools] MCP_UPDATE event received, refreshing tools')
      attemptRef.current = 0  // Reset attempts on external update
      clearRetryTimeout()
      fetchToolsWithRetry()
    }).then((unsub) => {
      unsubscribe = unsub
    }).catch((error) => {
      console.error('[useTools] Failed to set up MCP update listener:', error)
    })

    // Cleanup on unmount
    return () => {
      clearRetryTimeout()
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
