/**
 * Toolbar for Daily Leads page
 * Shows selection count and action buttons
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  IconPlayerPlay,
  IconPlus,
  IconLoader2,
  IconCheck,
  IconSquare,
  IconSquareCheck,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface DailyLeadsToolbarProps {
  selectedCount: number
  totalCount: number
  inQueueCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onAddToQueue: () => void
  onStartProspecting: () => void
  isAddingToQueue: boolean
  isStartingProspecting: boolean
  hasQueuedLeads: boolean
}

export default function DailyLeadsToolbar({
  selectedCount,
  totalCount,
  inQueueCount,
  onSelectAll,
  onDeselectAll,
  onAddToQueue,
  onStartProspecting,
  isAddingToQueue,
  isStartingProspecting,
  hasQueuedLeads,
}: DailyLeadsToolbarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0
  const someSelected = selectedCount > 0 && selectedCount < totalCount

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-main-view border-b border-border/50">
      {/* Left side - Selection info */}
      <div className="flex items-center gap-4">
        {/* Select all checkbox button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="gap-2"
        >
          {allSelected ? (
            <IconSquareCheck className="h-4 w-4 text-primary" />
          ) : someSelected ? (
            <IconSquareCheck className="h-4 w-4 text-primary/50" />
          ) : (
            <IconSquare className="h-4 w-4" />
          )}
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>

        {/* Selection count */}
        {selectedCount > 0 && (
          <span className="text-sm text-main-view-fg/70">
            {selectedCount} of {totalCount} selected
          </span>
        )}

        {/* Queue count badge */}
        {inQueueCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <IconCheck className="h-3 w-3" />
            {inQueueCount} in queue
          </Badge>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Add to Queue button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddToQueue}
          disabled={selectedCount === 0 || isAddingToQueue}
          className="gap-2"
        >
          {isAddingToQueue ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconPlus className="h-4 w-4" />
          )}
          Add to Queue
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedCount}
            </Badge>
          )}
        </Button>

        {/* Start Prospecting button */}
        <Button
          variant="default"
          size="sm"
          onClick={onStartProspecting}
          disabled={!hasQueuedLeads || isStartingProspecting}
          className={cn('gap-2', hasQueuedLeads && 'bg-green-600 hover:bg-green-700')}
        >
          {isStartingProspecting ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconPlayerPlay className="h-4 w-4" />
          )}
          Start Prospecting
        </Button>
      </div>
    </div>
  )
}
