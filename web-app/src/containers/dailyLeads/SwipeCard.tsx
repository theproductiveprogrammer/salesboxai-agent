/**
 * Large profile card for the "dating app" swipe experience
 * Shows current lead with Discard/Prospect action buttons
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconBriefcase,
  IconMapPin,
  IconUsers,
  IconUserPlus,
  IconLoader2,
  IconBrandLinkedin,
  IconStar,
} from '@tabler/icons-react'
import DiscardIcon from '@/assets/icons/discard.svg'
import ProspectIcon from '@/assets/icons/prospect.svg'
import { cn } from '@/lib/utils'
import { openUrl } from '@tauri-apps/plugin-opener'
import { useNavigate } from '@tanstack/react-router'
import type { DailyLead } from '@/types/dailyLeads'
import { LeadActivityHistory } from '@/containers/asyncJobs/LeadActivityHistory'

interface SwipeCardProps {
  lead: DailyLead | null
  onProspect: (lead: DailyLead) => void
  onDiscard: (lead: DailyLead) => void
  prospecting?: boolean
  loading?: boolean
}

const getInitials = (firstName?: string | null, lastName?: string | null): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last || '?'
}

const formatCount = (count?: number | null): string => {
  if (!count) return '0'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

function SwipeCardSkeleton() {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* Left button placeholder */}
      <Skeleton className="h-12 w-28 rounded-full" />

      {/* Card */}
      <Card className="overflow-hidden border-main-view-fg/10 flex-1 max-w-2xl">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
        <CardContent className="p-6 -mt-12">
          <div className="flex items-start gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 pt-10 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mt-4" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>

      {/* Right button placeholder */}
      <Skeleton className="h-12 w-28 rounded-full" />
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()

  return (
    <Card className="overflow-hidden border-main-view-fg/10">
      <CardContent className="p-12 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-main-view-fg mb-2">All done for today!</h3>
        <p className="text-main-view-fg/60 mb-6">
          You've reviewed all your recommended leads. Check back tomorrow for fresh prospects.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/chat' })}
          className="gap-2"
        >
          <IconUserPlus className="h-4 w-4" />
          Start New Chat
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SwipeCard({
  lead,
  onProspect,
  onDiscard,
  prospecting = false,
  loading = false,
}: SwipeCardProps) {
  if (loading) {
    return <SwipeCardSkeleton />
  }

  if (!lead) {
    return <EmptyState />
  }

  const profile = lead.profile

  const linkedinUrl = lead.linkedinUrl
    ? lead.linkedinUrl.startsWith('http')
      ? lead.linkedinUrl
      : `https://linkedin.com/in/${lead.linkedinUrl}`
    : null

  // Get display values from profile or fallback to lead data
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown'

  const headline = profile?.headline || lead.title || ''
  const location = profile?.location || lead.location || ''
  const company = profile?.work_experience?.[0]?.company || lead.company || ''
  const position = profile?.work_experience?.[0]?.position || lead.title || ''

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Discard button - Left side */}
      <button
        className={cn(
          "px-6 py-3 rounded-full shrink-0 flex items-center justify-center gap-2",
          "bg-muted/50 border border-border",
          "hover:bg-muted hover:scale-105",
          "active:scale-95 transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        )}
        onClick={() => onDiscard(lead)}
        disabled={prospecting}
        title="Discard"
      >
        <img src={DiscardIcon} alt="" className="h-5 w-5" />
        <span className="text-main-view-fg font-semibold">Discard</span>
      </button>

      {/* Card - Center */}
      <Card className="overflow-hidden border-main-view-fg/10 shadow-lg flex-1 max-w-2xl">
        {/* Background banner */}
        <div
          className={cn(
            'h-24 bg-gradient-to-r from-primary/20 to-primary/5',
            profile?.background_picture_url && 'bg-cover bg-center'
          )}
          style={
            profile?.background_picture_url
              ? { backgroundImage: `url(${profile.background_picture_url})` }
              : undefined
          }
        />

        <CardContent className="p-6 -mt-12">
          {/* Profile header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-24 w-24 ring-4 ring-card shrink-0">
              {profile?.profile_picture_url ? (
                <AvatarImage
                  src={profile.profile_picture_url_large || profile.profile_picture_url}
                  alt={displayName}
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                {getInitials(profile?.first_name || lead.firstName, profile?.last_name || lead.lastName)}
              </AvatarFallback>
            </Avatar>

            {/* Name and badges */}
            <div className="flex-1 min-w-0 pt-10">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-main-view-fg text-xl truncate">
                  {displayName}
                </h3>
                {profile?.is_premium && (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <IconStar className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Headline */}
          {headline && (
            <p className="text-base text-main-view-fg/80 mt-4 line-clamp-2">
              {headline}
            </p>
          )}

          {/* Company & Location */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-sm text-main-view-fg/60">
            {company && (
              <div className="flex items-center gap-1.5">
                <IconBriefcase className="h-4 w-4 shrink-0" />
                <span className="truncate">{position ? `${position} at ${company}` : company}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <IconMapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          {profile && (
            <div className="flex gap-6 mt-4 text-sm">
              <div className="flex items-center gap-1.5 text-main-view-fg/70">
                <IconUsers className="h-4 w-4" />
                <span className="font-medium">{formatCount(profile?.connections_count)}</span>
                <span className="text-main-view-fg/50">connections</span>
              </div>
              <div className="flex items-center gap-1.5 text-main-view-fg/70">
                <IconUserPlus className="h-4 w-4" />
                <span className="font-medium">{formatCount(profile?.follower_count)}</span>
                <span className="text-main-view-fg/50">followers</span>
              </div>
            </div>
          )}

          {/* Summary */}
          {profile?.summary && (
            <p className="text-sm text-main-view-fg/60 mt-4 line-clamp-4 bg-muted/50 p-4 rounded-lg">
              {profile.summary}
            </p>
          )}

          {/* LinkedIn link */}
          {linkedinUrl && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0A66C2] hover:text-[#0A66C2]/80"
                onClick={() => openUrl(linkedinUrl)}
              >
                <IconBrandLinkedin className="h-4 w-4 mr-2" />
                View on LinkedIn
              </Button>
            </div>
          )}

          {/* Activity History */}
          <LeadActivityHistory leadId={lead.leadId} />
        </CardContent>
      </Card>

      {/* Prospect button - Right side */}
      <button
        className={cn(
          "px-6 py-3 rounded-full shrink-0 flex items-center justify-center gap-2",
          "bg-muted/50 border border-border",
          "hover:bg-muted hover:scale-105",
          "active:scale-95 transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        )}
        onClick={() => onProspect(lead)}
        disabled={prospecting}
        title="Prospect"
      >
        {prospecting ? (
          <IconLoader2 className="h-5 w-5 text-main-view-fg animate-spin" />
        ) : (
          <img src={ProspectIcon} alt="" className="h-5 w-5" />
        )}
        <span className="text-main-view-fg font-semibold">Prospect</span>
      </button>
    </div>
  )
}
