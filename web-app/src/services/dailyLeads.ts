/**
 * Service for Daily Leads API calls
 */

import { callSalesboxApi } from './salesboxApi'
import type {
  DailyLead,
  DailyLeadsRequest,
  DailyLeadsResponse,
  AddToQueueRequest,
  AddToQueueResponse,
  QueueStatusRequest,
  QueueStatusResponse,
  StartQueueProspectingRequest,
  StartQueueProspectingResponse,
  FetchLeadProfileRequest,
} from '@/types/dailyLeads'

// Raw API response types (snake_case from backend)
interface RawDailyLeadsResponse {
  date?: string
  leads?: RawDailyLead[]
  criteria?: {
    countries?: string[]
    jobLevels?: string[]
    jobFunctions?: string[]
    industries?: string[]
    source?: string
  }
  error?: string
}

interface RawDailyLead {
  leadId?: number
  linkedinUrl?: string
  linkedinUsername?: string
  firstName?: string
  lastName?: string
  fullName?: string
  title?: string
  company?: string
  companyLinkedinUrl?: string
  location?: string
  industry?: string
  profile?: Record<string, unknown>
  posts?: Array<Record<string, unknown>>
}

/**
 * Map raw backend response to frontend DailyLead type
 */
function mapRawLead(raw: RawDailyLead): DailyLead {
  const hasProfile = !!raw.profile
  return {
    id: raw.linkedinUsername || raw.linkedinUrl || String(raw.leadId || Math.random()),
    linkedinUrl: raw.linkedinUrl || null,
    linkedinUsername: raw.linkedinUsername || null,
    firstName: raw.firstName || null,
    lastName: raw.lastName || null,
    fullName: raw.fullName || null,
    title: raw.title || null,
    company: raw.company || null,
    companyLinkedinUrl: raw.companyLinkedinUrl || null,
    location: raw.location || null,
    industry: raw.industry || null,
    leadId: raw.leadId || null,

    // Full profile data
    profile: raw.profile as DailyLead['profile'] || null,
    posts: raw.posts as DailyLead['posts'] || null,

    // Legacy/computed fields
    hasProfile,
    profilePictureUrl: (raw.profile as Record<string, unknown>)?.profile_picture_url as string || null,
    headline: (raw.profile as Record<string, unknown>)?.headline as string || null,
    connectionCount: (raw.profile as Record<string, unknown>)?.connections_count as number || null,

    // Default prospecting state
    isInQueue: false,
    prospectingStatus: null,
    nextCheckTimestamp: null,
  }
}

/**
 * Fetch daily leads for the current user
 */
export async function getDailyLeads(
  request: DailyLeadsRequest = {}
): Promise<DailyLeadsResponse> {
  const response = await callSalesboxApi<RawDailyLeadsResponse>('/mcp/daily-leads', {
    method: 'POST',
    body: JSON.stringify(request),
  })

  if (response.error || !response.data) {
    return {
      leads: [],
      totalCount: 0,
      inQueueCount: 0,
      date: new Date().toISOString().split('T')[0],
      criteria: {
        countries: [],
        jobLevels: [],
        jobFunctions: [],
        source: 'ERROR',
      },
      error: response.error || 'Failed to fetch daily leads',
    }
  }

  const rawData = response.data
  const leads = (rawData.leads || []).map(mapRawLead)

  return {
    leads,
    totalCount: leads.length,
    inQueueCount: 0,
    date: rawData.date || new Date().toISOString().split('T')[0],
    criteria: {
      countries: rawData.criteria?.countries || [],
      jobLevels: rawData.criteria?.jobLevels || [],
      jobFunctions: rawData.criteria?.jobFunctions || [],
      industries: rawData.criteria?.industries,
      source: rawData.criteria?.source || 'people-search',
    },
    error: rawData.error,
  }
}

/**
 * Add selected leads to the processing queue
 */
export async function addLeadsToQueue(
  linkedinUrls: string[]
): Promise<AddToQueueResponse> {
  const request: AddToQueueRequest = { linkedinUrls }

  const response = await callSalesboxApi<AddToQueueResponse>(
    '/mcp/daily-leads/add-to-queue',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  )

  if (response.error || !response.data) {
    return {
      prospectListId: null,
      addedCount: 0,
      alreadyInQueueCount: 0,
      addedLeadIds: [],
      error: response.error || 'Failed to add leads to queue',
    }
  }

  return response.data
}

/**
 * Get the current queue status
 */
export async function getQueueStatus(
  request: QueueStatusRequest = {}
): Promise<QueueStatusResponse> {
  const response = await callSalesboxApi<QueueStatusResponse>(
    '/mcp/daily-leads/queue-status',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  )

  if (response.error || !response.data) {
    return {
      prospectListId: null,
      workflowId: null,
      isRunning: false,
      isPaused: false,
      currentLeadId: null,
      pendingCount: 0,
      processingCount: 0,
      waitingCount: 0,
      completedCount: 0,
      failedCount: 0,
      nextWakeTimestamp: null,
      queuedLeads: [],
      error: response.error || 'Failed to get queue status',
    }
  }

  return response.data
}

/**
 * Start or resume the queue prospecting workflow
 */
export async function startQueueProspecting(
  request: StartQueueProspectingRequest = {}
): Promise<StartQueueProspectingResponse> {
  const response = await callSalesboxApi<StartQueueProspectingResponse>(
    '/mcp/daily-leads/start-prospecting',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  )

  if (response.error || !response.data) {
    return {
      workflowId: null,
      status: 'NO_LEADS',
      queueSize: 0,
      error: response.error || 'Failed to start queue prospecting',
    }
  }

  return response.data
}

/**
 * Fetch LinkedIn profile for a lead by lead ID
 */
export async function fetchLeadProfile(
  leadId: number
): Promise<DailyLead | { error: string }> {
  const request: FetchLeadProfileRequest = { id: leadId }

  const response = await callSalesboxApi<RawDailyLead & { error?: string }>(
    '/mcp/daily-leads/fetch-profile',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  )

  if (response.error || !response.data) {
    return { error: response.error || 'Failed to fetch profile' }
  }

  // Check if the response has an error field
  if (response.data.error) {
    return { error: response.data.error }
  }

  // Map the raw response to DailyLead
  return mapRawLead(response.data)
}
