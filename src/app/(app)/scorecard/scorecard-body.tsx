'use client'

import { useRef, useCallback } from 'react'
import { MetricRow } from '@/components/scorecard/metric-row'
import { logEntryDuration } from '@/lib/actions/scorecard'

type CategorizedMetric = {
  metric: {
    id: string
    name: string
    description: string | null
    metric_type: string
    target_value: number | null
  }
  currentEntry: {
    value: number | null
    status_color: string
    status_note: string | null
  } | null
  lastWeekEntry: {
    value: number | null
  } | null
}

type CategoryGroup = {
  category: string
  label: string
  metrics: CategorizedMetric[]
}

export function ScorecardBody({
  categorizedMetrics,
  tenantId,
  weekStart,
  memberId,
}: {
  categorizedMetrics: CategoryGroup[]
  tenantId: string
  weekStart: string
  memberId: string
}) {
  const firstInteraction = useRef<number | null>(null)

  const handleFirstTouch = useCallback(() => {
    if (firstInteraction.current === null) {
      firstInteraction.current = Date.now()
    }
  }, [])

  const handleSaveComplete = useCallback(() => {
    if (firstInteraction.current === null) return
    const durationSeconds = Math.round(
      (Date.now() - firstInteraction.current) / 1000
    )
    const totalMetrics = categorizedMetrics.reduce(
      (sum, group) => sum + group.metrics.length,
      0
    )
    logEntryDuration({
      tenantId,
      memberId,
      weekStart,
      durationSeconds,
      metricsFilled: totalMetrics,
    })
  }, [categorizedMetrics, tenantId, memberId, weekStart])

  return (
    <div className="space-y-6">
      {categorizedMetrics.map((group) => (
        <div key={group.category}>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {group.label}
          </h2>
          <div className="space-y-3">
            {group.metrics.map(({ metric, currentEntry, lastWeekEntry }) => (
              <MetricRow
                key={metric.id}
                metric={metric}
                currentEntry={currentEntry}
                lastWeekEntry={lastWeekEntry}
                tenantId={tenantId}
                weekStart={weekStart}
                memberId={memberId}
                onFirstTouch={handleFirstTouch}
                onSaveComplete={handleSaveComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
