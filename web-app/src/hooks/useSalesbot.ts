import { create } from 'zustand'
import { getSalesbotInfo, type SalesbotInfo } from '@/services/salesboxApi'

interface SalesbotState {
  salesbot: SalesbotInfo | null
  isLoading: boolean
  error: string | null
  hasFetched: boolean

  fetchSalesbot: () => Promise<void>
  clearSalesbot: () => void
}

export const useSalesbot = create<SalesbotState>()((set, get) => ({
  salesbot: null,
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchSalesbot: async () => {
    // Prevent duplicate fetches
    if (get().isLoading) return

    set({ isLoading: true, error: null })

    try {
      const salesbot = await getSalesbotInfo()

      if (salesbot) {
        set({
          salesbot,
          isLoading: false,
          error: null,
          hasFetched: true,
        })
      } else {
        set({
          salesbot: null,
          isLoading: false,
          error: 'No salesbot associated with your account. Please contact support.',
          hasFetched: true,
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch salesbot info'
      set({
        salesbot: null,
        isLoading: false,
        error: errorMessage,
        hasFetched: true,
      })
    }
  },

  clearSalesbot: () => {
    set({
      salesbot: null,
      isLoading: false,
      error: null,
      hasFetched: false,
    })
  },
}))
