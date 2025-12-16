/**
 * Daily Leads types and interfaces for the daily leads feature
 */

// Unipile profile data from LinkedIn
export interface UnipileProfile {
  object?: string
  provider?: string
  provider_id?: string
  public_identifier?: string
  member_urn?: string
  first_name?: string
  last_name?: string
  headline?: string
  is_open_profile?: boolean
  is_premium?: boolean
  is_influencer?: boolean
  is_creator?: boolean
  follower_count?: number
  connections_count?: number
  location?: string
  profile_picture_url?: string
  profile_picture_url_large?: string
  background_picture_url?: string
  summary?: string
  education?: Array<{
    degree?: string
    school?: string
    start?: string
    end?: string
  }>
  work_experience?: Array<{
    company?: string
    position?: string
    location?: string
    description?: string
    start?: string
    end?: string
  }>
  skills?: Array<{
    name?: string
    endorsement_count?: number
  }>
}

// LinkedIn post from Unipile
export interface UnipilePost {
  id?: string
  social_id?: string
  text?: string
  provider?: string
  is_repost?: boolean
  author?: {
    public_identifier?: string
    headline?: string
  }
}

export interface DailyLead {
  id: string // LinkedIn username or people-search ID
  linkedinUrl: string | null
  linkedinUsername: string | null
  firstName: string | null
  lastName: string | null
  fullName: string | null
  title: string | null
  company: string | null
  companyLinkedinUrl: string | null
  location: string | null
  industry: string | null
  leadId: number | null // SalesBox Lead ID if created

  // Full profile data (from Unipile/LinkedIn)
  profile: UnipileProfile | null
  posts: UnipilePost[] | null

  // Engagement score (0-100)
  engScore: number | null

  // Legacy profile state (for backwards compatibility)
  hasProfile: boolean // True if we've fetched full profile
  profilePictureUrl: string | null
  headline: string | null
  connectionCount: number | null

  // Prospecting state
  isInQueue: boolean // In user's Processing Queue
  prospectingStatus: LeadQueueState | null
  nextCheckTimestamp: number | null
}

export type LeadQueueState = 'PENDING' | 'PROCESSING' | 'WAITING' | 'COMPLETED' | 'FAILED'

export interface DailyLeadsCriteria {
  countries: string[]
  jobLevels: string[]
  jobFunctions: string[]
  industries?: string[]
  source: string
}

export interface DailyLeadsRequest {
  countries?: string[]
  jobLevels?: string[]
  jobFunctions?: string[]
  industries?: string[]
}

export interface DailyLeadsResponse {
  leads: DailyLead[]
  totalCount: number
  inQueueCount: number
  date: string
  criteria: DailyLeadsCriteria
  error?: string
}

export interface AddToQueueRequest {
  linkedinUrls: string[]
}

export interface AddToQueueResponse {
  prospectListId: number | null
  addedCount: number
  alreadyInQueueCount: number
  addedLeadIds: number[]
  error?: string
}

export interface QueueStatusRequest {
  // Currently empty, may add filters later
}

export interface QueueStatusResponse {
  prospectListId: number | null
  workflowId: string | null
  isRunning: boolean
  isPaused: boolean
  currentLeadId: number | null
  pendingCount: number
  processingCount: number
  waitingCount: number
  completedCount: number
  failedCount: number
  nextWakeTimestamp: number | null
  queuedLeads: DailyLead[]
  error?: string
}

export interface StartQueueProspectingRequest {
  // Currently empty
}

export interface StartQueueProspectingResponse {
  workflowId: string | null
  status: 'STARTED' | 'RESUMED' | 'ALREADY_RUNNING' | 'NO_LEADS'
  queueSize: number
  error?: string
}

export interface FetchLeadProfileRequest {
  id: number  // Lead ID
  name?: string
}

// Response is now a DailyLeadDTO with profile/posts populated
export interface FetchLeadProfileResponse extends DailyLead {
  error?: string
}

// UI state for lead selection
export interface DailyLeadsSelectionState {
  selectedIds: Set<string>
  selectLead: (id: string, linkedinUrl?: string) => void
  deselectLead: (id: string) => void
  toggleLead: (id: string, linkedinUrl?: string) => void
  selectAll: (leads: DailyLead[]) => void
  deselectAll: () => void
  isSelected: (id: string) => boolean
  getSelectedCount: () => number
  getSelectedUrls: () => string[]
}
