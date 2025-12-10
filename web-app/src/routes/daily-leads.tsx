/**
 * Daily Leads page - Shows 100 curated leads per day for prospecting
 * Uses caching: only fetches from backend once per day, instant on subsequent visits
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
import { useSalesboxEndpoint } from '@/hooks/useSalesboxEndpoint'
import { useDailyLeadsCache } from '@/hooks/useDailyLeadsCache'
import {
  getDailyLeads,
  fetchLeadProfile,
  prospectLead,
} from '@/services/dailyLeads'
import { DailyLeadsGrid } from '@/containers/dailyLeads'
import type { DailyLead } from '@/types/dailyLeads'

export const Route = createFileRoute('/daily-leads')({
  component: DailyLeadsPage,
})

function DailyLeadsPage() {
  const { endpoint } = useSalesboxEndpoint()
  const {
    leads: cachedLeads,
    date: cachedDate,
    setLeads: setCachedLeads,
    isCacheValid,
  } = useDailyLeadsCache()

  // Data state
  const [leads, setLeads] = useState<DailyLead[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [fetchingProfileIds, setFetchingProfileIds] = useState<Set<string>>(new Set())
  const [prospectingIds, setProspectingIds] = useState<Set<string>>(new Set())

  // Prevent duplicate fetches
  const fetchingRef = useRef(false)

  // Load daily leads - uses cache if valid, otherwise fetches from backend
  const loadLeads = useCallback(async (forceRefresh = false) => {
    if (!endpoint) {
      toast.error('Please configure your endpoint first')
      setLoading(false)
      return
    }

    // Prevent duplicate concurrent fetches
    if (fetchingRef.current) {
      console.log('[DailyLeads] Skipping duplicate fetch')
      return
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid()) {
      console.log('[DailyLeads] Using cached leads:', cachedLeads.length)
      setLeads(cachedLeads)
      setLoading(false)
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      console.log('[DailyLeads] Fetching from backend...')

      const response = await getDailyLeads()

      if (response.error) {
        toast.error(response.error)
      } else {
        const today = new Date().toISOString().split('T')[0]
        setLeads(response.leads)
        setCachedLeads(response.leads, today)
        console.log('[DailyLeads] Cached', response.leads.length, 'leads for', today)
      }
    } catch (error) {
      console.error('Failed to load daily leads:', error)
      toast.error('Failed to load daily leads')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [endpoint, isCacheValid, cachedLeads, setCachedLeads])

  // Load data on mount
  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  // Refresh data (force refresh bypasses cache)
  const refreshData = useCallback(async () => {
    setRefreshing(true)
    await loadLeads(true) // force refresh
    setRefreshing(false)
  }, [loadLeads])

  // Fetch profile for a lead
  const handleFetchProfile = async (lead: DailyLead) => {
    if (!lead.leadId) {
      toast.error('No Lead ID for this lead')
      return
    }

    setFetchingProfileIds((prev) => new Set(prev).add(lead.id))

    try {
      const response = await fetchLeadProfile(lead.leadId)

      if ('error' in response) {
        toast.error(response.error || 'Failed to fetch profile')
        return
      }

      toast.success(`Profile fetched for ${lead.fullName || lead.firstName}`)

      // Refresh the leads list to get the full profile data
      await loadLeads()
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to fetch profile')
    } finally {
      setFetchingProfileIds((prev) => {
        const next = new Set(prev)
        next.delete(lead.id)
        return next
      })
    }
  }

  // Prospect a single lead via IWF workflow
  const handleProspect = async (lead: DailyLead) => {
    if (!lead.linkedinUrl) {
      toast.error('No LinkedIn URL for this lead')
      return
    }

    if (!lead.leadId) {
      toast.error('Lead must be saved before prospecting. Try fetching the profile first.')
      return
    }

    setProspectingIds((prev) => new Set(prev).add(lead.id))

    try {
      const result = await prospectLead(lead)

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Update lead status locally
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, isInQueue: true, prospectingStatus: 'PENDING' as const }
            : l
        )
      )

      toast.success(`Started prospecting ${lead.fullName || lead.firstName}`)
    } catch (error) {
      console.error('Failed to prospect lead:', error)
      toast.error('Failed to start prospecting')
    } finally {
      setProspectingIds((prev) => {
        const next = new Set(prev)
        next.delete(lead.id)
        return next
      })
    }
  }

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

  console.log('Filter debug:', { searchTerm, totalLeads: leads.length, filteredCount: filteredLeads.length })

  return (
    <div className="h-full flex flex-col bg-main-view">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-main-view-fg/10">
        <div>
          <h1 className="text-2xl font-bold text-main-view-fg">Daily Leads</h1>
          <p className="text-main-view-fg/50 text-sm">
            {leads.length} curated leads for today
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

      {/* Leads Grid */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-main-view-fg/60">Loading daily leads...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-main-view-fg/50">
            <IconUsers className="h-12 w-12 mb-3" />
            <p className="font-medium text-lg">No leads found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try adjusting your search</p>
            )}
          </div>
        ) : (
          <DailyLeadsGrid
            leads={filteredLeads}
            onFetchProfile={handleFetchProfile}
            onProspect={handleProspect}
            fetchingProfileIds={fetchingProfileIds}
            prospectingIds={prospectingIds}
          />
        )}
      </div>
    </div>
  )
}
