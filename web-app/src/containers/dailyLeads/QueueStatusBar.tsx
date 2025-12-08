/**
 * Status bar showing the current queue prospecting workflow status
 */

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  IconClock,
  IconLoader2,
  IconPlayerPause,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react'
import type { QueueStatusResponse } from '@/types/dailyLeads'

interface QueueStatusBarProps {
  status: QueueStatusResponse | null
  loading?: boolean
}

function formatNextWake(timestamp: number | null): string {
  if (!timestamp) return 'Unknown'
  const now = Date.now()
  const diff = timestamp - now

  if (diff < 0) return 'Soon'

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export default function QueueStatusBar({ status, loading }: QueueStatusBarProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 bg-main-view border-t border-border/50">
        <IconLoader2 className="h-5 w-5 animate-spin text-main-view-fg/50" />
        <span className="ml-2 text-sm text-main-view-fg/50">Loading queue status...</span>
      </div>
    )
  }

  if (!status || status.error) {
    return null
  }

  const totalCount =
    status.pendingCount +
    status.processingCount +
    status.waitingCount +
    status.completedCount +
    status.failedCount

  if (totalCount === 0) {
    return null
  }

  const completedPercent = totalCount > 0
    ? Math.round((status.completedCount / totalCount) * 100)
    : 0

  return (
    <div className="py-3 px-6 bg-main-view border-t border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-main-view-fg">
            Queue Status
          </span>
          {status.isRunning ? (
            status.isPaused ? (
              <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
                <IconPlayerPause className="h-3 w-3" />
                Paused
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1 bg-green-500">
                <IconLoader2 className="h-3 w-3 animate-spin" />
                Running
              </Badge>
            )
          ) : (
            <Badge variant="secondary" className="gap-1">
              <IconClock className="h-3 w-3" />
              Idle
            </Badge>
          )}
        </div>

        {/* Next wake time */}
        {status.nextWakeTimestamp && (
          <div className="flex items-center gap-1 text-xs text-main-view-fg/60">
            <IconClock className="h-3 w-3" />
            Next check: {formatNextWake(status.nextWakeTimestamp)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <Progress value={completedPercent} className="h-2 mb-2" />

      {/* Status counts */}
      <div className="flex items-center gap-4 text-xs text-main-view-fg/70">
        <div className="flex items-center gap-1">
          <IconClock className="h-3 w-3 text-gray-500" />
          <span>{status.pendingCount} pending</span>
        </div>
        <div className="flex items-center gap-1">
          <IconLoader2 className="h-3 w-3 text-blue-500" />
          <span>{status.processingCount} processing</span>
        </div>
        <div className="flex items-center gap-1">
          <IconClock className="h-3 w-3 text-yellow-500" />
          <span>{status.waitingCount} waiting</span>
        </div>
        <div className="flex items-center gap-1">
          <IconCheck className="h-3 w-3 text-green-500" />
          <span>{status.completedCount} completed</span>
        </div>
        {status.failedCount > 0 && (
          <div className="flex items-center gap-1">
            <IconAlertCircle className="h-3 w-3 text-red-500" />
            <span>{status.failedCount} failed</span>
          </div>
        )}
      </div>
    </div>
  )
}
