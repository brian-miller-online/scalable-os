'use client'

import { useState } from 'react'
import { MetricForm } from './metric-form'
import { deleteMetric, restoreMetric, reorderMetric } from '@/lib/actions/metrics'

type Metric = {
  id: string
  name: string
  description: string | null
  metric_type: string
  category: string
  sort_order: number
  target_value: number | null
  aggregation: string
}

export function MetricList({
  metrics: initialMetrics,
  tenantId,
}: {
  metrics: Metric[]
  tenantId: string
}) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [deletedMetric, setDeletedMetric] = useState<{ id: string; name: string } | null>(null)
  const [undoTimeout, setUndoTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  async function handleDelete(metricId: string, metricName: string) {
    const result = await deleteMetric(metricId)
    if (result.success) {
      setMetrics((prev) => prev.filter((m) => m.id !== metricId))
      setDeletedMetric({ id: metricId, name: metricName })

      if (undoTimeout) clearTimeout(undoTimeout)
      const timeout = setTimeout(() => setDeletedMetric(null), 5000)
      setUndoTimeout(timeout)
    }
  }

  async function handleUndo() {
    if (!deletedMetric) return
    const result = await restoreMetric(deletedMetric.id)
    if (result.success) {
      // Refresh page to get restored metric
      window.location.reload()
    }
    if (undoTimeout) clearTimeout(undoTimeout)
    setDeletedMetric(null)
  }

  async function handleReorder(metricId: string, direction: 'up' | 'down') {
    const result = await reorderMetric(metricId, direction, tenantId)
    if (result.success) {
      window.location.reload()
    }
  }

  function handleSaved() {
    setEditingId(null)
    setShowAdd(false)
    window.location.reload()
  }

  // Group by category
  const categories = [
    { key: 'always_track', label: 'Always Track' },
    { key: 'quarterly_focus', label: "This Quarter's Focus" },
  ]

  return (
    <div className="space-y-6">
      {deletedMetric && (
        <div className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm">
          <span>"{deletedMetric.name}" deleted</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-blue-600 font-medium hover:text-blue-800"
            style={{ minHeight: '44px' }}
          >
            Undo
          </button>
        </div>
      )}

      {categories.map(({ key, label }) => {
        const categoryMetrics = metrics.filter((m) => m.category === key)
        if (categoryMetrics.length === 0) return null
        return (
          <div key={key}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {label}
            </h2>
            <div className="space-y-2">
              {categoryMetrics.map((metric, index) => (
                <div key={metric.id}>
                  {editingId === metric.id ? (
                    <MetricForm
                      mode="edit"
                      metric={metric}
                      tenantId={tenantId}
                      onSaved={handleSaved}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleReorder(metric.id, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          style={{ minWidth: '44px', minHeight: '22px' }}
                          aria-label="Move up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(metric.id, 'down')}
                          disabled={index === categoryMetrics.length - 1}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          style={{ minWidth: '44px', minHeight: '22px' }}
                          aria-label="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setEditingId(metric.id)}
                      >
                        <p className="font-medium text-sm">{metric.name}</p>
                        {metric.description && (
                          <p className="text-xs text-gray-400">{metric.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {metric.metric_type} · {metric.aggregation}
                          {metric.target_value != null && ` · Target: ${metric.target_value}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(metric.id, metric.name)}
                        className="text-red-400 hover:text-red-600 p-2"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                        aria-label="Delete metric"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {showAdd ? (
        <MetricForm
          mode="add"
          tenantId={tenantId}
          onSaved={handleSaved}
          onCancel={() => setShowAdd(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
          style={{ minHeight: '44px' }}
        >
          + Add Metric
        </button>
      )}
    </div>
  )
}
