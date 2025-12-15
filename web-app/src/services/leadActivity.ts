import { callSalesboxApi } from './salesboxApi'

// Types matching backend LeadActivityHistoryResDTO

export interface TimelineEntry {
  activityId: number
  timestamp: string
  relativeTime: string
  category: string
  actionCode: number
  actionLabel: string
  actorType: 'USER' | 'LEAD' | 'BOT'
  actorName: string
  channel: string
  subject: string | null
  contentPreview: string | null
  sentiment: string | null
  sentimentConfidence: number | null
}

export interface ConversationMessage {
  conversationId: number
  direction: 'OUTBOUND' | 'INBOUND'
  timestamp: string
  subject: string | null
  content: string | null
  sentiment: string | null
  sentimentConfidence: number | null
  activityId: number | null
}

export interface ConversationThread {
  channel: string
  threadId: string
  messageCount: number
  lastActivity: string
  overallSentiment: string | null
  messages: ConversationMessage[]
}

export interface ConversationSummary {
  totalThreads: number
  threads: ConversationThread[]
}

export interface EngagementMetrics {
  totalActivities: number
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  emailsReplied: number
  linkedInMessages: number
  linkedInConnections: number
  callsMade: number
  positiveResponses: number
  negativeResponses: number
  lastContactDate: string | null
  daysSinceLastContact: number
}

export interface LeadActivityHistory {
  leadId: number
  leadName: string
  leadEmail: string | null
  leadTitle: string | null
  company: string | null
  currentStatus: string | null
  timeline: TimelineEntry[]
  conversationSummary: ConversationSummary | null
  engagementMetrics: EngagementMetrics | null
  error: string | null
}

export interface LeadActivityHistoryRequest {
  leadId: number
  limit?: number
  includeFullContent?: boolean
}

export async function getLeadActivityHistory(
  leadId: number,
  limit: number = 20
): Promise<LeadActivityHistory> {
  const response = await callSalesboxApi<LeadActivityHistory>(
    '/mcp/lead-activity-history',
    {
      method: 'POST',
      body: JSON.stringify({
        leadId,
        limit,
        includeFullContent: false,
      } as LeadActivityHistoryRequest),
    }
  )

  if (response.error) {
    throw new Error(response.error)
  }

  if (!response.data) {
    throw new Error('No data returned from lead activity history API')
  }

  return response.data
}
