/**
 * Instagram-style profile card for leads with fetched profiles
 * Shows profile picture, background, headline, summary, and recent posts
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  IconBriefcase,
  IconMapPin,
  IconUsers,
  IconUserPlus,
  IconLoader2,
  IconChevronDown,
  IconChevronUp,
  IconBrandLinkedin,
  IconMessage,
  IconStar,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { DailyLead } from '@/types/dailyLeads'

interface ProfileCardProps {
  lead: DailyLead
  onProspect?: (lead: DailyLead) => void
  prospecting?: boolean
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

export default function ProfileCard({
  lead,
  onProspect,
  prospecting = false,
}: ProfileCardProps) {
  const [showPosts, setShowPosts] = useState(false)
  const profile = lead.profile

  const handleProspect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onProspect?.(lead)
  }

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
    <Card className="overflow-hidden border-main-view-fg/10 hover:shadow-lg transition-shadow">
      {/* Background banner */}
      <div
        className={cn(
          'h-20 bg-gradient-to-r from-primary/20 to-primary/5',
          profile?.background_picture_url && 'bg-cover bg-center'
        )}
        style={
          profile?.background_picture_url
            ? { backgroundImage: `url(${profile.background_picture_url})` }
            : undefined
        }
      />

      <CardContent className="p-5 -mt-10">
        {/* Profile header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-20 w-20 ring-4 ring-card shrink-0">
            {profile?.profile_picture_url ? (
              <AvatarImage
                src={profile.profile_picture_url_large || profile.profile_picture_url}
                alt={displayName}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
              {getInitials(profile?.first_name || lead.firstName, profile?.last_name || lead.lastName)}
            </AvatarFallback>
          </Avatar>

          {/* Name and badges */}
          <div className="flex-1 min-w-0 pt-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-main-view-fg text-lg truncate">
                {displayName}
              </h3>
              {profile?.is_premium && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <IconStar className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {profile?.is_open_profile && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                  Open
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Headline */}
        {headline && (
          <p className="text-sm text-main-view-fg/80 mt-3 line-clamp-2">
            {headline}
          </p>
        )}

        {/* Company & Location */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-main-view-fg/60">
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
        <div className="flex gap-4 mt-4 text-sm">
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

        {/* Summary */}
        {profile?.summary && (
          <p className="text-sm text-main-view-fg/60 mt-4 line-clamp-3 bg-muted/50 p-3 rounded-lg">
            {profile.summary}
          </p>
        )}

        {/* Recent posts toggle */}
        {lead.posts && lead.posts.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowPosts(!showPosts)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <IconMessage className="h-4 w-4" />
              {lead.posts.length} recent post{lead.posts.length !== 1 ? 's' : ''}
              {showPosts ? (
                <IconChevronUp className="h-4 w-4" />
              ) : (
                <IconChevronDown className="h-4 w-4" />
              )}
            </button>

            {showPosts && (
              <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                {lead.posts.slice(0, 3).map((post, idx) => (
                  <div
                    key={post.id || idx}
                    className="text-xs text-main-view-fg/60 bg-muted/30 p-3 rounded-lg line-clamp-4"
                  >
                    {post.text || '(No text)'}
                    {post.is_repost && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Repost
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-5 pt-4 border-t border-main-view-fg/10">
          {linkedinUrl && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(linkedinUrl, '_blank')}
            >
              <IconBrandLinkedin className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleProspect}
            disabled={prospecting}
          >
            {prospecting ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <IconUserPlus className="h-4 w-4 mr-2" />
                Prospect
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
