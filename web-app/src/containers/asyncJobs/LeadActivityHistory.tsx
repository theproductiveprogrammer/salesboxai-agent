import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import {
  getLeadActivityHistory,
  LeadActivityHistory as LeadActivityHistoryType,
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
          Lead Context
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

      {/* Expanded content - Pre-formatted summary (same text LLM sees) */}
      {isExpanded && data && (
        <div className="px-5 pb-4">
          {data.formattedSummary ? (
            <pre className="text-xs text-main-view-fg/70 whitespace-pre-wrap font-sans leading-relaxed">
              {data.formattedSummary}
            </pre>
          ) : (
            <p className="text-sm text-main-view-fg/50 text-center py-2">
              No activity history found
            </p>
          )}
        </div>
      )}
    </div>
  )
}
