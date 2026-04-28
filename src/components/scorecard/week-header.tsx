'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formatWeekLabel, getPreviousWeekStart } from '@/utils/week'

export function WeekHeader({
  weekStart,
  currentWeekStart,
}: {
  weekStart: string
  currentWeekStart: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isCurrentWeek = weekStart === currentWeekStart
  const previousWeek = getPreviousWeekStart(weekStart)

  function navigateToWeek(targetWeek: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (targetWeek === currentWeekStart) {
      params.delete('week')
    } else {
      params.set('week', targetWeek)
    }
    const query = params.toString()
    router.push(`/scorecard${query ? `?${query}` : ''}`)
  }

  return (
    <div className="flex items-center justify-between py-2">
      <button
        type="button"
        onClick={() => navigateToWeek(previousWeek)}
        className="flex items-center justify-center text-gray-500 hover:text-gray-900"
        style={{ minWidth: '44px', minHeight: '44px' }}
        aria-label="Previous week"
        data-testid="week-prev"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="text-center">
        <p className="text-sm font-semibold" data-testid="week-label">
          Week of {formatWeekLabel(weekStart)}
        </p>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={() => navigateToWeek(currentWeekStart)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-0.5"
            data-testid="week-current"
          >
            Back to current week
          </button>
        )}
      </div>

      <div style={{ minWidth: '44px', minHeight: '44px' }} />
    </div>
  )
}
