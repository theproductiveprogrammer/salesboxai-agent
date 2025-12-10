/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useDailyLeadsCache } from '@/hooks/useDailyLeadsCache'
import { route } from '@/constants/routes'
import { IconLoader2 } from '@tabler/icons-react'

export const Route = createFileRoute(route.home as any)({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const { fetchLeads, isFetching } = useDailyLeadsCache()
  const [minDelayPassed, setMinDelayPassed] = useState(false)

  // Start prefetching Daily Leads immediately
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Minimum display time for smooth UX (avoid flash)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayPassed(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Navigate to Daily Leads once data is ready and minimum time has passed
  useEffect(() => {
    if (!isFetching && minDelayPassed) {
      navigate({ to: '/daily-leads' })
    }
  }, [isFetching, minDelayPassed, navigate])

  return (
    <div className="flex h-full items-center justify-center bg-main-view">
      <div className="text-center animate-in fade-in duration-500">
        {/* Logo */}
        <img
          src="/salesbox-logo.png"
          alt="SalesboxAI"
          className="h-8 mx-auto mb-6"
        />

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2 text-main-view-fg/60">
          <IconLoader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    </div>
  )
}
