type MetricSummary = {
  name: string
  metric_type: string
  aggregation: string
  target_value: number | null
  monthlyValue: number | null
}

function formatValue(value: number | null, metricType: string): string {
  if (value == null) return '—'
  if (metricType === 'currency') {
    return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  if (metricType === 'percentage') {
    return value + '%'
  }
  return String(value)
}

export function MonthlyActuals({
  metrics,
}: {
  metrics: MetricSummary[]
}) {
  if (metrics.every((m) => m.monthlyValue == null)) {
    return null
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Month to Date
      </h2>
      <div className="space-y-2">
        {metrics.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between text-sm"
            data-testid={`monthly-${m.name}`}
          >
            <span className="text-gray-600">{m.name}</span>
            <span className="font-medium">
              {formatValue(m.monthlyValue, m.metric_type)}
              {m.target_value != null && m.monthlyValue != null && (
                <span className="text-gray-400 font-normal">
                  {' / '}
                  {formatValue(m.target_value, m.metric_type)}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
