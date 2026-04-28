'use client'

import { STATUS_COLORS, type StatusColor } from '@/types/scorecard'

const COLOR_ORDER: Exclude<StatusColor, 'not_set'>[] = [
  'dark_green',
  'lime_green',
  'yellow',
  'light_red',
  'dark_red',
]

export function ColorPicker({
  selected,
  onSelect,
}: {
  selected: StatusColor
  onSelect: (color: StatusColor) => void
}) {
  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Status color">
      {COLOR_ORDER.map((color) => {
        const isSelected = selected === color
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.replace(/_/g, ' ')}
            onClick={() => onSelect(isSelected ? 'not_set' : color)}
            className="flex items-center justify-center"
            style={{ width: '44px', height: '44px' }}
            data-testid={`color-${color}`}
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: STATUS_COLORS[color],
              }}
            >
              {isSelected && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
