/**
 * Hook for managing lead selection state in the Daily Leads view
 */

import { create } from 'zustand'
import type { DailyLead, DailyLeadsSelectionState } from '@/types/dailyLeads'

interface DailyLeadsSelectionStore extends DailyLeadsSelectionState {
  // Internal state
  selectedIds: Set<string>
  selectedUrlMap: Map<string, string> // id -> linkedinUrl
}

export const useDailyLeadsSelection = create<DailyLeadsSelectionStore>((set, get) => ({
  selectedIds: new Set(),
  selectedUrlMap: new Map(),

  selectLead: (id: string, linkedinUrl?: string) => {
    set((state) => {
      const newIds = new Set(state.selectedIds)
      const newUrlMap = new Map(state.selectedUrlMap)
      newIds.add(id)
      if (linkedinUrl) {
        newUrlMap.set(id, linkedinUrl)
      }
      return { selectedIds: newIds, selectedUrlMap: newUrlMap }
    })
  },

  deselectLead: (id: string) => {
    set((state) => {
      const newIds = new Set(state.selectedIds)
      const newUrlMap = new Map(state.selectedUrlMap)
      newIds.delete(id)
      newUrlMap.delete(id)
      return { selectedIds: newIds, selectedUrlMap: newUrlMap }
    })
  },

  toggleLead: (id: string, linkedinUrl?: string) => {
    const { isSelected, selectLead, deselectLead } = get()
    if (isSelected(id)) {
      deselectLead(id)
    } else {
      selectLead(id, linkedinUrl)
    }
  },

  selectAll: (leads: DailyLead[]) => {
    set(() => {
      const newIds = new Set<string>()
      const newUrlMap = new Map<string, string>()
      leads.forEach((lead) => {
        if (lead.id) {
          newIds.add(lead.id)
          if (lead.linkedinUrl) {
            newUrlMap.set(lead.id, lead.linkedinUrl)
          }
        }
      })
      return { selectedIds: newIds, selectedUrlMap: newUrlMap }
    })
  },

  deselectAll: () => {
    set({ selectedIds: new Set(), selectedUrlMap: new Map() })
  },

  isSelected: (id: string) => {
    return get().selectedIds.has(id)
  },

  getSelectedCount: () => {
    return get().selectedIds.size
  },

  getSelectedUrls: () => {
    const { selectedUrlMap } = get()
    return Array.from(selectedUrlMap.values())
  },
}))
