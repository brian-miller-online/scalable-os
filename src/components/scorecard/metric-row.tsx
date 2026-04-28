'use client'

import { useState, useCallback, useRef } from 'react'
import { ColorPicker } from './color-picker'
import { StatusNote } from './status-note'
import { saveEntry } from '@/lib/actions/scorecard'
import type { StatusColor } from '@/types/scorecard'

type MetricRowProps = {
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
  tenantId: string
  weekStart: string
  memberId: string
  onFirstTouch: () => void
  onSaveComplete: () => void
}

function formatDisplayValue(value: number | null, metricType: string): string {
  if (value == null) return ''
  if (metricType === 'currency') {
    return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  if (metricType === 'percentage') {
    return value + '%'
  }
  return String(value)
}

export function MetricRow({
  metric,
  currentEntry,
  lastWeekEntry,
  tenantId,
  weekStart,
  memberId,
  onFirstTouch,
  onSaveComplete,
}: MetricRowProps) {
  const [value, setValue] = useState(
    currentEntry?.value != null ? String(currentEntry.value) : ''
  )
  const [color, setColor] = useState<StatusColor>(
    (currentEntry?.status_color as StatusColor) || 'not_set'
  )
  const [note, setNote] = useState(currentEntry?.status_note || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Track what was last saved to avoid duplicate saves
  const lastSaved = useRef({
    value: currentEntry?.value ?? null as number | null,
    color: (currentEntry?.status_color as StatusColor) || 'not_set',
    note: currentEntry?.status_note || '',
  })

  const doSave = useCallback(
    async (fields: {
      value: number | null
      statusColor: string
      statusNote: string | null
    }) => {
      setSaving(true)
      const result = await saveEntry({
        metricId: metric.id,
        weekStart,
        tenantId,
        memberId,
        value: fields.value,
        statusColor: fields.statusColor,
        statusNote: fields.statusNote,
      })
      setSaving(false)

      if (result.success) {
        lastSaved.current = {
          value: fields.value,
          color: fields.statusColor as StatusColor,
          note: fields.statusNote || '',
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 300)
        onSaveComplete()
      }
    },
    [metric.id, weekStart, tenantId, memberId, onSaveComplete]
  )

  function handleValueBlur() {
    onFirstTouch()
    const parsed = value.trim() ? parseFloat(value.replace(/[,$]/g, '')) : null
    if (parsed !== lastSaved.current.value) {
      doSave({ value: parsed, statusColor: color, statusNote: note || null })
    }
  }

  function handleColorSelect(newColor: StatusColor) {
    onFirstTouch()
    setColor(newColor)
    const parsed = value.trim() ? parseFloat(value.replace(/[,$]/g, '')) : null
    doSave({ value: parsed, statusColor: newColor, statusNote: note || null })
  }

  function handleNoteBlur() {
    if (note !== lastSaved.current.note) {
      const parsed = value.trim() ? parseFloat(value.replace(/[,$]/g, '')) : null
      doSave({ value: parsed, statusColor: color, statusNote: note || null })
    }
  }

  const inputMode =
    metric.metric_type === 'currency' || metric.metric_type === 'decimal'
      ? ('decimal' as const)
      : ('numeric' as const)

  const lastWeekDisplay = formatDisplayValue(lastWeekEntry?.value ?? null, metric.metric_type)

  return (
    <div
      className={`rounded-lg border p-3 transition-colors duration-300 ${
        saved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      }`}
      data-testid={`metric-row-${metric.id}`}
    >
      {/* Row 1: Metric name + color picker */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{metric.name}</p>
          {metric.description && (
            <p className="text-xs text-gray-400">{metric.description}</p>
          )}
          {lastWeekEntry?.value != null && (
            <p className="text-xs text-gray-400">Last week: {lastWeekDisplay}</p>
          )}
        </div>
        <ColorPicker selected={color} onSelect={handleColorSelect} />
      </div>

      {/* Row 2: Value input */}
      <div className="mt-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onFirstTouch()
          }}
          onBlur={handleValueBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder={lastWeekDisplay || 'Enter value'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          style={{ minHeight: '44px' }}
          data-testid={`input-${metric.id}`}
        />
      </div>

      {/* Row 3: Status note (expands for yellow/red) */}
      <StatusNote color={color} note={note} onChange={setNote} onBlur={handleNoteBlur} />

      {/* Save indicator */}
      {saving && <p className="text-xs text-gray-400 mt-1">Saving...</p>}
    </div>
  )
}
