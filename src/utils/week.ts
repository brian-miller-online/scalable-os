/**
 * Get the Monday (week start) for a given date.
 * Returns YYYY-MM-DD string.
 */
export function getWeekStart(
  date: Date = new Date(),
  timezone: string = 'UTC'
): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const localDateStr = formatter.format(date)

  const [year, month, day] = localDateStr.split('-').map(Number)
  const localDate = new Date(year, month - 1, day)
  const dayOfWeek = localDate.getDay()

  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  localDate.setDate(localDate.getDate() - daysToMonday)

  const y = localDate.getFullYear()
  const m = String(localDate.getMonth() + 1).padStart(2, '0')
  const d = String(localDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Get the current week's Monday.
 */
export function getCurrentWeekStart(timezone: string = 'UTC'): string {
  return getWeekStart(new Date(), timezone)
}

/**
 * Get the Monday 7 days before the given week start.
 * Input and output are both YYYY-MM-DD strings.
 */
export function getPreviousWeekStart(weekStart: string): string {
  const [year, month, day] = weekStart.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 7)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Format a YYYY-MM-DD week start as "Month Day, Year".
 * Example: "2026-04-27" → "April 27, 2026"
 */
export function formatWeekLabel(weekStart: string): string {
  const [year, month, day] = weekStart.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
