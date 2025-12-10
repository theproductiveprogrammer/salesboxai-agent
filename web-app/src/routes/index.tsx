/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useDailyLeadsCache } from '@/hooks/useDailyLeadsCache'
import { fetchLeadProfile } from '@/services/dailyLeads'
import { route } from '@/constants/routes'
import { IconLoader2 } from '@tabler/icons-react'

export const Route = createFileRoute(route.home as any)({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const { fetchLeads, isFetching, leads, updateLead } = useDailyLeadsCache()
  const [profileFetched, setProfileFetched] = useState(false)
  const [minDelayPassed, setMinDelayPassed] = useState(false)

  // Start prefetching Daily Leads list immediately
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Once leads are loaded, prefetch first lead's profile
  // Track if we've seen isFetching go to true (fetch started)
  const [fetchStarted, setFetchStarted] = useState(false)

  useEffect(() => {
    if (isFetching && !fetchStarted) {
      console.log('[Splash] Fetch started')
      setFetchStarted(true)
    }
  }, [isFetching, fetchStarted])

  // Fetch is complete when: fetchStarted is true AND isFetching is now false
  const fetchComplete = fetchStarted && !isFetching

  useEffect(() => {
    const prefetchFirstProfile = async () => {
      console.log('[Splash] prefetchFirstProfile called', { fetchStarted, isFetching, fetchComplete, leadsLength: leads.length, profileFetched })

      // Only proceed if fetch has completed and we haven't fetched profile yet
      if (!fetchComplete || profileFetched) {
        return
      }

      if (leads.length > 0) {
        const firstLead = leads[0]
        console.log('[Splash] First lead:', firstLead.id, 'has profile:', !!firstLead.profile)
        if (firstLead.leadId && !firstLead.profile) {
          try {
            console.log('[Splash] Fetching profile for lead:', firstLead.leadId)
            const response = await fetchLeadProfile(firstLead.leadId)
            console.log('[Splash] Profile fetched:', !!response.profile)
            if (!('error' in response) && response.profile) {
              updateLead(firstLead.id, { profile: response.profile, posts: response.posts })
            }
          } catch (error) {
            console.error('Failed to prefetch profile:', error)
          }
        }
        console.log('[Splash] Setting profileFetched = true')
        setProfileFetched(true)
      } else {
        // Leads loaded but empty
        console.log('[Splash] No leads available, setting profileFetched = true')
        setProfileFetched(true)
      }
    }
    prefetchFirstProfile()
  }, [fetchComplete, leads, profileFetched, updateLead])

  // Minimum display time for smooth UX (avoid flash)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayPassed(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Navigate to Daily Leads once everything is ready
  useEffect(() => {
    if (!isFetching && profileFetched && minDelayPassed) {
      navigate({ to: '/daily-leads' })
    }
  }, [isFetching, profileFetched, minDelayPassed, navigate])

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
