import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  MailOpen,
  MousePointerClick,
  Reply,
  MessageSquare,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import {
  getLeadActivityHistory,
  LeadActivityHistory as LeadActivityHistoryType,
  TimelineEntry,
  EngagementMetrics,
} from '@/services/leadActivity'

interface LeadActivityHistoryProps {
  leadId: number | null | undefined
}

export function LeadActivityHistory({ leadId }: LeadActivityHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<LeadActivityHistoryType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    if (isExpanded) {
      setIsExpanded(false)
      return
    }

    if (!leadId) {
      setError('No lead ID available')
      return
    }

    // If we already have data, just expand
    if (data) {
      setIsExpanded(true)
      return
    }

    // Fetch data
    setIsLoading(true)
    setError(null)
    try {
      const result = await getLeadActivityHistory(leadId, 20)
      setData(result)
      setIsExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity history')
    } finally {
      setIsLoading(false)
    }
  }

  // Get icon for activity channel/type
  const getActivityIcon = (entry: TimelineEntry) => {
    const channel = entry.channel?.toUpperCase() || ''
    const label = entry.actionLabel?.toLowerCase() || ''

    if (channel === 'EMAIL' || label.includes('email')) {
      if (label.includes('opened')) return <MailOpen size={14} className="text-blue-500" />
      if (label.includes('clicked')) return <MousePointerClick size={14} className="text-green-500" />
      if (label.includes('replied') || label.includes('reply')) return <Reply size={14} className="text-purple-500" />
      return <Mail size={14} className="text-gray-500" />
    }
    if (channel === 'LINKEDIN' || label.includes('linkedin')) {
      return <MessageSquare size={14} className="text-blue-600" />
    }
    if (channel === 'PHONE' || label.includes('call')) {
      return <Phone size={14} className="text-green-600" />
    }
    return <Calendar size={14} className="text-gray-500" />
  }

  // Get sentiment indicator
  const getSentimentIndicator = (sentiment: string | null) => {
    if (!sentiment) return null
    const s = sentiment.toLowerCase()
    if (s === 'positive' || s === 'interested') {
      return <TrendingUp size={12} className="text-green-500" />
    }
    if (s === 'negative' || s === 'not_interested') {
      return <TrendingDown size={12} className="text-red-500" />
    }
    return null
  }

  // Render engagement metrics summary
  const renderMetricsSummary = (metrics: EngagementMetrics) => {
    const items: { label: string; value: number; highlight?: boolean }[] = []

    if (metrics.emailsOpened > 0) items.push({ label: 'opened', value: metrics.emailsOpened })
    if (metrics.emailsClicked > 0) items.push({ label: 'clicked', value: metrics.emailsClicked })
    if (metrics.emailsReplied > 0) items.push({ label: 'replied', value: metrics.emailsReplied, highlight: true })
    if (metrics.linkedInMessages > 0) items.push({ label: 'LI msgs', value: metrics.linkedInMessages })
    if (metrics.positiveResponses > 0) items.push({ label: 'positive', value: metrics.positiveResponses, highlight: true })

    if (items.length === 0 && metrics.emailsSent > 0) {
      items.push({ label: 'sent', value: metrics.emailsSent })
    }

    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {items.map((item, i) => (
          <span
            key={i}
            className={`px-2 py-0.5 rounded ${
              item.highlight
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-main-view-fg/5 text-main-view-fg/70'
            }`}
          >
            {item.value} {item.label}
          </span>
        ))}
        {metrics.daysSinceLastContact > 0 && (
          <span className="px-2 py-0.5 rounded bg-main-view-fg/5 text-main-view-fg/60">
            {metrics.daysSinceLastContact}d ago
          </span>
        )}
      </div>
    )
  }

  if (!leadId) {
    return null
  }

  return (
    <div className="border-t border-border/30">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-main-view-fg/80 hover:bg-main-view-fg/[0.02] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Calendar size={14} className="text-primary" />
          Activity History
          {data?.engagementMetrics && data.engagementMetrics.totalActivities > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
              {data.engagementMetrics.totalActivities}
            </span>
          )}
        </span>
        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-primary" />
        ) : isExpanded ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="px-5 py-2 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && data && (
        <div className="px-5 pb-4">
          {/* Engagement metrics summary */}
          {data.engagementMetrics && data.engagementMetrics.totalActivities > 0 && (
            <div className="mb-3">
              {renderMetricsSummary(data.engagementMetrics)}
            </div>
          )}

          {/* Activity timeline */}
          {data.timeline && data.timeline.length > 0 ? (
            <div className="space-y-2">
              {data.timeline.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.activityId || index}
                  className="flex items-start gap-2 p-2 bg-main-view-fg/[0.02] rounded-md"
                >
                  <div className="mt-0.5">{getActivityIcon(entry)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-main-view-fg/90 font-medium">
                        {entry.actionLabel}
                      </span>
                      {getSentimentIndicator(entry.sentiment)}
                      <span className="text-xs text-main-view-fg/50 ml-auto">
                        {entry.relativeTime}
                      </span>
                    </div>
                    {entry.contentPreview && (
                      <p className="text-xs text-main-view-fg/60 mt-0.5 line-clamp-1">
                        {entry.contentPreview}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {data.timeline.length > 10 && (
                <p className="text-xs text-main-view-fg/50 text-center py-1">
                  +{data.timeline.length - 10} more activities
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-main-view-fg/50 text-center py-2">
              No activity history found
            </p>
          )}

          {/* Conversation threads summary */}
          {data.conversationSummary && data.conversationSummary.totalThreads > 0 && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-main-view-fg/60 mb-2">
                {data.conversationSummary.totalThreads} conversation{' '}
                {data.conversationSummary.totalThreads === 1 ? 'thread' : 'threads'}
              </p>
              <div className="space-y-2">
                {data.conversationSummary.threads.slice(0, 3).map((thread, index) => (
                  <div
                    key={thread.threadId || index}
                    className="flex items-center gap-2 text-xs text-main-view-fg/70"
                  >
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                      {thread.channel}
                    </span>
                    <span>{thread.messageCount} messages</span>
                    {thread.overallSentiment && (
                      <span className="ml-auto">{getSentimentIndicator(thread.overallSentiment)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
