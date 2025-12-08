/**
 * Grid layout for Daily Leads
 * Split into two sections:
 * 1. Leads without profiles - compact list view
 * 2. Leads with profiles - Instagram-style cards
 */

import { useMemo } from 'react'
import LeadListItem from './LeadListItem'
import ProfileCard from './ProfileCard'
import type { DailyLead } from '@/types/dailyLeads'

interface DailyLeadsGridProps {
  leads: DailyLead[]
  onFetchProfile?: (lead: DailyLead) => void
  onProspect?: (lead: DailyLead) => void
  fetchingProfileIds?: Set<string>
  prospectingIds?: Set<string>
}

export default function DailyLeadsGrid({
  leads,
  onFetchProfile,
  onProspect,
  fetchingProfileIds = new Set(),
  prospectingIds = new Set(),
}: DailyLeadsGridProps) {
  // Check if a profile has meaningful data (not just an empty object)
  const hasValidProfile = (lead: DailyLead): boolean => {
    if (!lead.profile) return false
    const p = lead.profile
    // Check if profile has at least one useful field
    return !!(
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

  // Split leads into two groups
  const { leadsWithProfile, leadsWithoutProfile } = useMemo(() => {
    const withProfile: DailyLead[] = []
    const withoutProfile: DailyLead[] = []

    for (const lead of leads) {
      const valid = hasValidProfile(lead)
      console.log('Lead check:', lead.fullName, 'profile:', lead.profile, 'hasValidProfile:', valid)
      if (valid) {
        withProfile.push(lead)
      } else {
        withoutProfile.push(lead)
      }
    }

    console.log('Split result:', { withProfile: withProfile.length, withoutProfile: withoutProfile.length })
    return { leadsWithProfile: withProfile, leadsWithoutProfile: withoutProfile }
  }, [leads])

  return (
    <div className="space-y-8">
      {/* Leads with profiles - Instagram-style cards */}
      {leadsWithProfile.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-main-view-fg mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-sm font-bold">
              {leadsWithProfile.length}
            </span>
            Ready to Prospect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {leadsWithProfile.map((lead, index) => (
              <ProfileCard
                key={`profile-${lead.id}-${index}`}
                lead={lead}
                onProspect={onProspect}
                prospecting={prospectingIds.has(lead.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Leads without profiles - compact list */}
      {leadsWithoutProfile.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-main-view-fg mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-muted text-muted-foreground rounded-full text-sm font-bold">
              {leadsWithoutProfile.length}
            </span>
            New Leads
          </h2>
          <div className="bg-card border border-main-view-fg/10 rounded-lg divide-y divide-main-view-fg/10">
            {leadsWithoutProfile.map((lead, index) => (
              <LeadListItem
                key={`list-${lead.id}-${index}`}
                lead={lead}
                onFetchProfile={onFetchProfile}
                fetchingProfile={fetchingProfileIds.has(lead.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {leads.length === 0 && (
        <div className="text-center py-12 text-main-view-fg/50">
          <p>No leads found</p>
        </div>
      )}
    </div>
  )
}
