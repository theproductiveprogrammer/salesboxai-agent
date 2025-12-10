/**
 * Main view for Daily Leads - "Dating app" swipe experience
 * Shows current lead card at top, remaining leads list below
 */

import SwipeCard from './SwipeCard'
import LeadListItem from './LeadListItem'
import type { DailyLead } from '@/types/dailyLeads'

interface DailyLeadsViewProps {
  leads: DailyLead[]
  currentLead: DailyLead | null
  onProspect: (lead: DailyLead) => void
  onDiscard: (lead: DailyLead) => void
  onRemove: (lead: DailyLead) => void
  onSelect: (lead: DailyLead) => void
  prospectingId?: string
  loadingProfile?: boolean
}

export default function DailyLeadsView({
  leads,
  currentLead,
  onProspect,
  onDiscard,
  onRemove,
  onSelect,
  prospectingId,
  loadingProfile = false,
}: DailyLeadsViewProps) {
  // Remaining leads are all leads except the current one
  const remainingLeads = currentLead
    ? leads.filter((lead) => lead.id !== currentLead.id)
    : leads

  return (
    <div className="space-y-6">
      {/* Current lead card */}
      <section>
        <SwipeCard
          lead={currentLead}
          onProspect={onProspect}
          onDiscard={onDiscard}
          prospecting={currentLead ? prospectingId === currentLead.id : false}
          loading={loadingProfile}
        />
      </section>

      {/* Remaining leads list */}
      {remainingLeads.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-main-view-fg mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-muted text-muted-foreground rounded-full text-sm font-bold">
              {remainingLeads.length}
            </span>
            Remaining Leads
          </h2>
          <div className="bg-card border border-main-view-fg/10 rounded-lg divide-y divide-main-view-fg/10 max-h-[400px] overflow-y-auto">
            {remainingLeads.map((lead, index) => (
              <LeadListItem
                key={`list-${lead.id}-${index}`}
                lead={lead}
                onRemove={onRemove}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
