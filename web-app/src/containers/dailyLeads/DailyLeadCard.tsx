/**
 * Card component for displaying a single daily lead
 * Shows basic info initially, with option to fetch full profile
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  IconBuilding,
  IconMapPin,
  IconDownload,
  IconLoader2,
  IconCheck,
  IconClock,
  IconAlertCircle,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { DailyLead, LeadQueueState } from '@/types/dailyLeads'

interface DailyLeadCardProps {
  lead: DailyLead
  onFetchProfile?: (lead: DailyLead) => void
  onProspect?: (lead: DailyLead) => void
  fetchingProfile?: boolean
  prospecting?: boolean
}

const getInitials = (firstName?: string | null, lastName?: string | null): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last || '?'
}

const getStatusBadge = (status: LeadQueueState | null) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="secondary" className="gap-1">
          <IconClock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case 'PROCESSING':
      return (
        <Badge variant="default" className="gap-1 bg-blue-500">
          <IconLoader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      )
    case 'WAITING':
      return (
        <Badge variant="secondary" className="gap-1 bg-yellow-500 text-yellow-50">
          <IconClock className="h-3 w-3" />
          Waiting
        </Badge>
      )
    case 'COMPLETED':
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <IconCheck className="h-3 w-3" />
          Completed
        </Badge>
      )
    case 'FAILED':
      return (
        <Badge variant="destructive" className="gap-1">
          <IconAlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    default:
      return null
  }
}

export default function DailyLeadCard({
  lead,
  onFetchProfile,
  onProspect,
  fetchingProfile = false,
  prospecting = false,
}: DailyLeadCardProps) {
  const handleFetchProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFetchProfile?.(lead)
  }

  const handleProspect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onProspect?.(lead)
  }

  const isProcessing = lead.isInQueue && lead.prospectingStatus !== 'COMPLETED' && lead.prospectingStatus !== 'FAILED'
  const isCompleted = lead.isInQueue && lead.prospectingStatus === 'COMPLETED'
  const isFailed = lead.isInQueue && lead.prospectingStatus === 'FAILED'

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg border-main-view-fg/10 relative',
        lead.isInQueue && 'border-l-4 border-l-primary'
      )}
    >
      <CardContent className="p-5">
        {/* Action button - top right */}
        <div className="absolute top-3 right-3">
          {!lead.hasProfile && !lead.isInQueue && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleFetchProfile}
              disabled={fetchingProfile}
              title="Fetch Profile"
            >
              {fetchingProfile ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconDownload className="h-4 w-4" />
              )}
            </Button>
          )}
          {lead.hasProfile && !lead.isInQueue && (
            <Button
              variant="default"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleProspect}
              disabled={prospecting}
              title="Start Prospecting"
            >
              {prospecting ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconCheck className="h-4 w-4" />
              )}
            </Button>
          )}
          {isProcessing && getStatusBadge(lead.prospectingStatus)}
          {isCompleted && (
            <Badge className="text-xs gap-1 bg-green-500/10 text-green-600 border-green-500/20">
              <IconCheck className="h-3 w-3" />
              Done
            </Badge>
          )}
          {isFailed && getStatusBadge('FAILED')}
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            {lead.hasProfile && lead.profilePictureUrl ? (
              <AvatarImage src={lead.profilePictureUrl} alt={lead.fullName || ''} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {getInitials(lead.firstName, lead.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-main-view-fg text-base text-center mb-1">
          {lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown'}
        </h3>

        {/* Title */}
        {lead.title && (
          <p className="text-sm text-main-view-fg/70 text-center mb-3 line-clamp-2">
            {lead.title}
          </p>
        )}

        {/* Company */}
        {lead.company && (
          <div className="flex items-center justify-center gap-2 text-sm text-main-view-fg/60 mb-2">
            <IconBuilding className="h-4 w-4 shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}

        {/* Location */}
        {lead.location && (
          <div className="flex items-center justify-center gap-2 text-sm text-main-view-fg/40">
            <IconMapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{lead.location}</span>
          </div>
        )}

        {/* Headline (when profile is fetched) */}
        {lead.hasProfile && lead.headline && (
          <p className="text-xs text-main-view-fg/50 text-center mt-3 line-clamp-2 italic">
            {lead.headline}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
