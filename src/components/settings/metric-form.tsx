'use client'

import { useState } from 'react'
import { addMetric, updateMetric } from '@/lib/actions/metrics'

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

export function MetricForm({
  mode,
  metric,
  tenantId,
  onSaved,
  onCancel,
}: {
  mode: 'add' | 'edit'
  metric?: Metric
  tenantId: string
  onSaved: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(metric?.name || '')
  const [description, setDescription] = useState(metric?.description || '')
  const [metricType, setMetricType] = useState(metric?.metric_type || 'integer')
  const [category, setCategory] = useState(metric?.category || 'always_track')
  const [aggregation, setAggregation] = useState(metric?.aggregation || 'latest')
  const [targetValue, setTargetValue] = useState(
    metric?.target_value != null ? String(metric.target_value) : ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)

    const target = targetValue.trim() ? parseFloat(targetValue) : null

    if (mode === 'add') {
      const result = await addMetric({
        tenantId,
        name: name.trim(),
        description: description.trim() || null,
        metricType,
        category,
        aggregation,
        targetValue: target,
      })
      if (result.error) {
        setError(result.error)
        setSaving(false)
        return
      }
    } else if (metric) {
      const result = await updateMetric(metric.id, {
        name: name.trim(),
        description: description.trim() || null,
        metricType,
        category,
        aggregation,
        targetValue: target,
      })
      if (result.error) {
        setError(result.error)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    onSaved()
  }

  const selectClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const inputClass = selectClass

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3 space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Metric name"
        className={inputClass}
        style={{ minHeight: '44px' }}
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional — helper text shown on scorecard)"
        className={inputClass}
        style={{ minHeight: '44px' }}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          className={selectClass}
          style={{ minHeight: '44px' }}
        >
          <option value="integer">Integer</option>
          <option value="currency">Currency ($)</option>
          <option value="percentage">Percentage (%)</option>
          <option value="decimal">Decimal</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
          style={{ minHeight: '44px' }}
        >
          <option value="always_track">Always Track</option>
          <option value="quarterly_focus">This Quarter's Focus</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={aggregation}
          onChange={(e) => setAggregation(e.target.value)}
          className={selectClass}
          style={{ minHeight: '44px' }}
        >
          <option value="latest">Latest (snapshot)</option>
          <option value="sum">Sum (cumulative)</option>
          <option value="average">Average</option>
        </select>
        <input
          type="text"
          inputMode="decimal"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder="Monthly target"
          className={inputClass}
          style={{ minHeight: '44px' }}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
          style={{ minHeight: '44px' }}
        >
          {saving ? 'Saving...' : mode === 'add' ? 'Add Metric' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          style={{ minHeight: '44px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
