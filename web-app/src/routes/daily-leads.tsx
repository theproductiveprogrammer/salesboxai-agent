/**
 * Daily Leads page - "Dating app" style swipe experience
 * Shows current lead card at top with Prospect/Discard actions
 * Remaining leads displayed in a list below
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  IconRefresh,
  IconSearch,
  IconLoader2,
  IconUsers,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useDailyLeadsCache } from '@/hooks/useDailyLeadsCache'
import { fetchLeadProfile, prospectLead, removeDailyLead } from '@/services/dailyLeads'
import { DailyLeadsView } from '@/containers/dailyLeads'
import type { DailyLead } from '@/types/dailyLeads'

export const Route = createFileRoute('/daily-leads')({
  component: DailyLeadsPage,
})

function DailyLeadsPage() {
  const {
    leads,
    isFetching,
    fetchLeads,
    updateLead,
    removeLead,
    getCurrentLead,
    getUpcomingLeads,
  } = useDailyLeadsCache()

  // Local UI state
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [prospectingId, setProspectingId] = useState<string | null>(null)
  const [fetchingProfileId, setFetchingProfileId] = useState<string | null>(null)

  // Track which leads have been prefetched
  const prefetchedIds = useRef<Set<string>>(new Set())

  // Get current lead from store
  const currentLead = getCurrentLead()

  // Load data on mount (will use cache if valid, or join existing fetch)
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Pre-fetch profiles for upcoming leads
  useEffect(() => {
    const prefetchUpcoming = async () => {
      // Prefetch current lead if no profile
      if (currentLead && !currentLead.profile && currentLead.leadId && !prefetchedIds.current.has(currentLead.id)) {
        prefetchedIds.current.add(currentLead.id)
        setFetchingProfileId(currentLead.id)
        try {
          const response = await fetchLeadProfile(currentLead.leadId)
          if (!('error' in response) && response.profile) {
            updateLead(currentLead.id, { profile: response.profile, posts: response.posts })
          }
        } catch (error) {
          console.error('Failed to prefetch profile:', error)
        } finally {
          setFetchingProfileId(null)
        }
      }

      // Prefetch next 2 leads in background
      const upcoming = getUpcomingLeads(2)
      for (const lead of upcoming) {
        if (!lead.profile && lead.leadId && !prefetchedIds.current.has(lead.id)) {
          prefetchedIds.current.add(lead.id)
          try {
            const response = await fetchLeadProfile(lead.leadId)
            if (!('error' in response) && response.profile) {
              updateLead(lead.id, { profile: response.profile, posts: response.posts })
            }
          } catch (error) {
            console.error('Failed to prefetch profile:', error)
          }
        }
      }
    }

    prefetchUpcoming()
  }, [currentLead?.id, getUpcomingLeads, updateLead])

  // Refresh data (force refresh bypasses cache)
  const refreshData = useCallback(async () => {
    setRefreshing(true)
    prefetchedIds.current.clear()
    try {
      await fetchLeads(true)
    } finally {
      setRefreshing(false)
    }
  }, [fetchLeads])

  // Discard a lead (remove from list and backend)
  const handleDiscard = useCallback(async (lead: DailyLead) => {
    // Remove from frontend immediately for snappy UX
    removeLead(lead.id)
    toast.success(`Discarded ${lead.fullName || lead.firstName || 'lead'}`)

    // Remove from backend (fire-and-forget, don't block UI)
    if (lead.leadId) {
      removeDailyLead(lead.leadId).catch((error) => {
        console.error('Failed to remove lead from backend:', error)
      })
    }
  }, [removeLead])

  // Prospect a lead and move to next
  const handleProspect = useCallback(async (lead: DailyLead) => {
    if (!lead.linkedinUrl) {
      toast.error('No LinkedIn URL for this lead')
      return
    }

    if (!lead.leadId) {
      toast.error('Lead must be saved before prospecting')
      return
    }

    setProspectingId(lead.id)

    try {
      const result = await prospectLead(lead)

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Update lead status and remove from list
      updateLead(lead.id, { isInQueue: true, prospectingStatus: 'PENDING' as const })
      removeLead(lead.id)

      toast.success(`Started prospecting ${lead.fullName || lead.firstName}`)
    } catch (error) {
      console.error('Failed to prospect lead:', error)
      toast.error('Failed to start prospecting')
    } finally {
      setProspectingId(null)
    }
  }, [updateLead, removeLead])

  // Remove a lead from the list (same as discard)
  const handleRemove = useCallback((lead: DailyLead) => {
    // Remove from frontend immediately
    removeLead(lead.id)

    // Remove from backend (fire-and-forget)
    if (lead.leadId) {
      removeDailyLead(lead.leadId).catch((error) => {
        console.error('Failed to remove lead from backend:', error)
      })
    }
  }, [removeLead])

  // Filter leads by search term (client-side)
  const filteredLeads = leads.filter((lead) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      lead.fullName?.toLowerCase().includes(searchLower) ||
      lead.firstName?.toLowerCase().includes(searchLower) ||
      lead.lastName?.toLowerCase().includes(searchLower) ||
      lead.company?.toLowerCase().includes(searchLower) ||
      lead.title?.toLowerCase().includes(searchLower)
    )
  })

  // Show loading only on initial fetch (not when we have cached data)
  const showLoading = isFetching && leads.length === 0

  // Get current lead from filtered list if searching
  const displayCurrentLead = searchTerm ? filteredLeads[0] ?? null : currentLead

  return (
    <div className="h-full flex flex-col bg-main-view">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-main-view-fg/10">
        <div>
          <h1 className="text-2xl font-bold text-main-view-fg">Daily Leads</h1>
          <p className="text-main-view-fg/50 text-sm">
            {leads.length} leads remaining today
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={refreshing}
          className="gap-2"
        >
          <IconRefresh className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-main-view-fg/10">
        <div className="relative max-w-md">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-main-view-fg/40" />
          <Input
            placeholder="Search by name, title, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {showLoading ? (
          <div className="flex items-center justify-center h-48">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-main-view-fg/60">Loading daily leads...</span>
          </div>
        ) : filteredLeads.length === 0 && leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-main-view-fg/50">
            <IconUsers className="h-12 w-12 mb-3" />
            <p className="font-medium text-lg">No leads available</p>
            <p className="text-sm mt-1">Check back tomorrow for new prospects</p>
          </div>
        ) : filteredLeads.length === 0 && searchTerm ? (
          <div className="flex flex-col items-center justify-center h-48 text-main-view-fg/50">
            <IconUsers className="h-12 w-12 mb-3" />
            <p className="font-medium text-lg">No leads found</p>
            <p className="text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <DailyLeadsView
            leads={filteredLeads}
            currentLead={displayCurrentLead}
            onProspect={handleProspect}
            onDiscard={handleDiscard}
            onRemove={handleRemove}
            prospectingId={prospectingId ?? undefined}
            loadingProfile={fetchingProfileId === displayCurrentLead?.id}
          />
        )}
      </div>
    </div>
  )
}
