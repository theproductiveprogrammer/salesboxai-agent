/**
 * Compact list item for leads without fetched profiles
 * Shows basic info: Job Title - Company (Industry) / User Name - Location
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  IconDownload,
  IconLoader2,
  IconBrandLinkedin,
  IconAlertTriangle,
} from '@tabler/icons-react'
import type { DailyLead } from '@/types/dailyLeads'

interface LeadListItemProps {
  lead: DailyLead
  onFetchProfile?: (lead: DailyLead) => void
  fetchingProfile?: boolean
}

// Check if profile was attempted but returned empty/invalid data
const hasFailedProfileFetch = (lead: DailyLead): boolean => {
  if (!lead.profile) return false
  const p = lead.profile
  // Profile object exists but has no useful data
  return !(
    p.headline ||
    p.summary ||
    p.profile_picture_url ||
    p.first_name ||
    p.last_name ||
    p.connections_count ||
    p.follower_count ||
    (p.work_experience && p.work_experience.length > 0)
  )
}

export default function LeadListItem({
  lead,
  onFetchProfile,
  fetchingProfile = false,
}: LeadListItemProps) {
  const handleFetchProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFetchProfile?.(lead)
  }

  const displayName = lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown'
  const profileFetchFailed = hasFailedProfileFetch(lead)

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
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Line 1: Title - Company (Industry) */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-main-view-fg/80 truncate">
            {titleLine || 'No title info'}
          </p>
          {profileFetchFailed && (
            <Badge variant="destructive" className="text-xs gap-1 shrink-0">
              <IconAlertTriangle className="h-3 w-3" />
              Profile fetch failed
            </Badge>
          )}
        </div>

        {/* Line 2: Name - Location */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-main-view-fg truncate">
            {displayName}
          </span>
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
            onClick={() => window.open(linkedinUrl, '_blank')}
            title="View LinkedIn Profile"
          >
            <IconBrandLinkedin className="h-4 w-4 text-[#0A66C2]" />
          </Button>
        )}
        {profileFetchFailed ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleFetchProfile}
            disabled={fetchingProfile}
          >
            {fetchingProfile ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <IconDownload className="h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleFetchProfile}
            disabled={fetchingProfile}
          >
            {fetchingProfile ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <IconDownload className="h-4 w-4" />
                Fetch Profile
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
