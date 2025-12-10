import { create } from 'zustand'
import type { DailyLead } from '@/types/dailyLeads'

interface DailyLeadsCacheState {
  leads: DailyLead[]
  date: string | null // "2024-12-10" format
  lastFetchTime: number | null // timestamp

  // Actions
  setLeads: (leads: DailyLead[], date: string) => void
  updateLead: (leadId: string, updates: Partial<DailyLead>) => void
  clearCache: () => void
  isCacheValid: () => boolean
}

/**
 * Zustand store for caching daily leads.
 * Cache is valid for the current day only.
 */
export const useDailyLeadsCache = create<DailyLeadsCacheState>((set, get) => ({
  leads: [],
  date: null,
  lastFetchTime: null,

  setLeads: (leads, date) => {
    set({
      leads,
      date,
      lastFetchTime: Date.now(),
    })
  },

  updateLead: (leadId, updates) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, ...updates } : lead
      ),
    }))
  },

  clearCache: () => {
    set({
      leads: [],
      date: null,
      lastFetchTime: null,
    })
  },

  isCacheValid: () => {
    const { date, leads } = get()
    if (!date || leads.length === 0) return false

    // Check if cache date matches today
    const today = new Date().toISOString().split('T')[0]
    return date === today
  },
}))
