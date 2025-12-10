import { create } from 'zustand'
import type { DailyLead } from '@/types/dailyLeads'
import { getDailyLeads } from '@/services/dailyLeads'

interface DailyLeadsCacheState {
  leads: DailyLead[]
  date: string | null // "2024-12-10" format
  lastFetchTime: number | null // timestamp
  isFetching: boolean
  fetchPromise: Promise<DailyLead[]> | null
  currentIndex: number // Track which lead is shown as "current card"

  // Actions
  setLeads: (leads: DailyLead[], date: string) => void
  updateLead: (leadId: string, updates: Partial<DailyLead>) => void
  removeLead: (leadId: string) => void
  clearCache: () => void
  isCacheValid: () => boolean
  fetchLeads: (force?: boolean) => Promise<DailyLead[]>

  // Swipe card navigation
  getCurrentLead: () => DailyLead | null
  getUpcomingLeads: (count: number) => DailyLead[]
  nextLead: () => void
  setCurrentIndex: (index: number) => void
}

/**
 * Zustand store for caching daily leads.
 * Cache is valid for the current day only.
 * Includes deduplication to prevent multiple concurrent fetches.
 */
export const useDailyLeadsCache = create<DailyLeadsCacheState>((set, get) => ({
  leads: [],
  date: null,
  lastFetchTime: null,
  isFetching: false,
  fetchPromise: null,
  currentIndex: 0,

  setLeads: (leads, date) => {
    set({
      leads,
      date,
      lastFetchTime: Date.now(),
      currentIndex: 0, // Reset to first lead when leads are refreshed
    })
  },

  updateLead: (leadId, updates) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, ...updates } : lead
      ),
    }))
  },

  removeLead: (leadId) => {
    set((state) => {
      const newLeads = state.leads.filter((lead) => lead.id !== leadId)
      // Adjust currentIndex if needed
      const newIndex = Math.min(state.currentIndex, Math.max(0, newLeads.length - 1))
      return { leads: newLeads, currentIndex: newIndex }
    })
  },

  clearCache: () => {
    set({
      leads: [],
      date: null,
      lastFetchTime: null,
      currentIndex: 0,
    })
  },

  isCacheValid: () => {
    const { date, leads } = get()
    if (!date || leads.length === 0) return false

    // Check if cache date matches today
    const today = new Date().toISOString().split('T')[0]
    return date === today
  },

  fetchLeads: async (force = false) => {
    const state = get()

    // Return cached leads if valid and not forcing refresh
    if (!force && state.isCacheValid()) {
      console.log('[DailyLeadsCache] Returning cached leads:', state.leads.length)
      return state.leads
    }

    // If already fetching, return the existing promise (deduplication)
    if (state.isFetching && state.fetchPromise) {
      console.log('[DailyLeadsCache] Fetch in progress, returning existing promise')
      return state.fetchPromise
    }

    // Start new fetch
    console.log('[DailyLeadsCache] Starting new fetch...')
    const fetchPromise = (async () => {
      try {
        set({ isFetching: true, fetchPromise: null })

        const response = await getDailyLeads()

        if (response.error) {
          console.error('[DailyLeadsCache] Fetch error:', response.error)
          return state.leads // Return existing leads on error
        }

        const today = new Date().toISOString().split('T')[0]
        set({
          leads: response.leads,
          date: today,
          lastFetchTime: Date.now(),
          isFetching: false,
          fetchPromise: null,
        })

        console.log('[DailyLeadsCache] Fetched and cached', response.leads.length, 'leads')
        return response.leads
      } catch (error) {
        console.error('[DailyLeadsCache] Fetch failed:', error)
        set({ isFetching: false, fetchPromise: null })
        return state.leads
      }
    })()

    // Store the promise so concurrent calls can await the same fetch
    set({ fetchPromise: fetchPromise })

    return fetchPromise
  },

  // Swipe card navigation
  getCurrentLead: () => {
    const { leads, currentIndex } = get()
    return leads[currentIndex] ?? null
  },

  getUpcomingLeads: (count: number) => {
    const { leads, currentIndex } = get()
    return leads.slice(currentIndex + 1, currentIndex + 1 + count)
  },

  nextLead: () => {
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.leads.length - 1),
    }))
  },

  setCurrentIndex: (index: number) => {
    set((state) => ({
      currentIndex: Math.max(0, Math.min(index, state.leads.length - 1)),
    }))
  },
}))
