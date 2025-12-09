/**
 * Service for Daily Leads API calls
 */

import { callSalesboxApi } from './salesboxApi'
import type {
  DailyLead,
  DailyLeadsRequest,
  DailyLeadsResponse,
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

// Backend response for prospect-lead endpoint
interface ProspectLeadResponse {
  job_id?: string
  job_status?: string
  job_message?: string
  error?: string
}

export interface ProspectLeadResult {
  jobId: string | null
  status: string
  message: string | null
  error?: string
}

/**
 * Start prospecting for a single lead via the IWF workflow.
 * The backend expects agentContext in the X-SBAgent-Context header.
 */
export async function prospectLead(
  lead: DailyLead
): Promise<ProspectLeadResult> {
  // Build the agent context to send in header
  const agentContext = {
    lead_id: lead.leadId,
    lead_name: lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
    lead_title: lead.title || lead.headline,
    lead_linkedin: lead.linkedinUrl,
    lead_email: null,
    lead_company: lead.company,
    // Include profile picture for display in prospecting tab
    lead_profile_picture: lead.profilePictureUrl || lead.profile?.profile_picture_url || null,
  }

  const response = await callSalesboxApi<ProspectLeadResponse>(
    '/mcp/prospect-lead',
    {
      method: 'POST',
      body: JSON.stringify({}), // Empty body - ChatCtxDTO not needed for this call
      headers: {
        'X-SBAgent-Context': JSON.stringify(agentContext),
      },
    }
  )

  if (response.error || !response.data) {
    return {
      jobId: null,
      status: 'ERROR',
      message: null,
      error: response.error || 'Failed to start prospecting',
    }
  }

  // Check if the job_status is ERROR
  if (response.data.job_status === 'ERROR') {
    return {
      jobId: response.data.job_id || null,
      status: 'ERROR',
      message: null,
      error: response.data.job_message || 'Prospecting failed',
    }
  }

  return {
    jobId: response.data.job_id || null,
    status: response.data.job_status || 'RUNNING',
    message: response.data.job_message || null,
  }
}
