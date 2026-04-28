'use client'

import { NOTE_REQUIRED_COLORS, NOTE_PLACEHOLDERS, type StatusColor } from '@/types/scorecard'

export function StatusNote({
  color,
  note,
  onChange,
  onBlur,
}: {
  color: StatusColor
  note: string
  onChange: (note: string) => void
  onBlur: () => void
}) {
  const isExpanded = NOTE_REQUIRED_COLORS.includes(color)
  const placeholder = NOTE_PLACEHOLDERS[color] || ''
  const isEmpty = !note.trim()

  return (
    <div
      className="overflow-hidden transition-all duration-200 ease-in-out"
      style={{ maxHeight: isExpanded ? '200px' : '0' }}
    >
      <div className="pt-2">
        <textarea
          value={note}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={2}
          className={`w-full rounded-lg border px-3 py-2 text-sm resize-none
            focus:outline-none focus:ring-1 focus:ring-blue-500
            ${isExpanded && isEmpty ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500'}`}
          style={{ minHeight: '44px' }}
          data-testid="status-note"
        />
        {isExpanded && isEmpty && (
          <p className="text-xs text-red-500 mt-1">Required</p>
        )}
      </div>
    </div>
  )
}
