/**
 * Compact list item for leads in the remaining leads list
 * Shows basic info: Job Title - Company (Industry) / User Name - Location
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  IconX,
  IconBrandLinkedin,
  IconFlame,
} from '@tabler/icons-react'
import { openUrl } from '@tauri-apps/plugin-opener'
import { cn } from '@/lib/utils'
import type { DailyLead } from '@/types/dailyLeads'

const getScoreStyle = (score: number) => {
  if (score >= 70) return 'bg-green-500/10 text-green-600 border-green-500/20'
  if (score >= 40) return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  return 'bg-main-view-fg/5 text-main-view-fg/60 border-main-view-fg/10'
}

interface LeadListItemProps {
  lead: DailyLead
  onRemove?: (lead: DailyLead) => void
  onSelect?: (lead: DailyLead) => void
}

export default function LeadListItem({
  lead,
  onRemove,
  onSelect,
}: LeadListItemProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove?.(lead)
  }

  const handleSelect = () => {
    onSelect?.(lead)
  }

  const displayName = lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown'

  const linkedinUrl = lead.linkedinUrl
    ? lead.linkedinUrl.startsWith('http')
      ? lead.linkedinUrl
      : `https://linkedin.com/in/${lead.linkedinUrl}`
    : null

  // Build the info lines
  const titleLine = [lead.title, lead.company, lead.industry ? `(${lead.industry})` : null]
    .filter(Boolean)
    .join(' - ')

  const locationLine = lead.location

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={handleSelect}
    >
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Line 1: Title - Company (Industry) */}
        <p className="text-sm font-medium text-main-view-fg/80 truncate">
          {titleLine || 'No title info'}
        </p>

        {/* Line 2: Name - Score - Location */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-main-view-fg truncate">
            {displayName}
          </span>
          <Badge
            variant="outline"
            className={cn('text-xs py-0 px-1.5', getScoreStyle(lead.engScore ?? 0))}
          >
            <IconFlame className="h-3 w-3 mr-0.5" />
            {Math.round(lead.engScore ?? 0)}
          </Badge>
          {locationLine && (
            <>
              <span className="text-main-view-fg/30">-</span>
              <span className="text-sm text-main-view-fg/50 truncate">
                {locationLine}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {linkedinUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => { e.stopPropagation(); openUrl(linkedinUrl) }}
            title="View LinkedIn Profile"
          >
            <IconBrandLinkedin className="h-4 w-4 text-[#0A66C2]" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleRemove}
        >
          <IconX className="h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  )
}
