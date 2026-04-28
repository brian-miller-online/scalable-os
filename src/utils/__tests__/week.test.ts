import { getWeekStart, getCurrentWeekStart, getPreviousWeekStart, formatWeekLabel } from '../week'

describe('getWeekStart', () => {
  it('returns Monday for a Wednesday date', () => {
    const result = getWeekStart(new Date('2026-04-29T12:00:00Z'))
    expect(result).toBe('2026-04-27')
  })

  it('returns the same day for a Monday', () => {
    const result = getWeekStart(new Date('2026-04-27T12:00:00Z'))
    expect(result).toBe('2026-04-27')
  })

  it('returns Monday for a Sunday date', () => {
    const result = getWeekStart(new Date('2026-05-03T12:00:00Z'))
    expect(result).toBe('2026-04-27')
  })

  it('handles timezone-aware week start', () => {
    const result = getWeekStart(
      new Date('2026-04-27T03:00:00Z'),
      'America/New_York'
    )
    expect(result).toBe('2026-04-20')
  })
})

describe('getCurrentWeekStart', () => {
  it('returns a date string in YYYY-MM-DD format', () => {
    const result = getCurrentWeekStart()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getPreviousWeekStart', () => {
  it('returns the Monday 7 days before the given week start', () => {
    expect(getPreviousWeekStart('2026-04-27')).toBe('2026-04-20')
  })

  it('handles month boundaries', () => {
    expect(getPreviousWeekStart('2026-05-04')).toBe('2026-04-27')
  })

  it('handles year boundaries', () => {
    expect(getPreviousWeekStart('2026-01-05')).toBe('2025-12-29')
  })
})

describe('formatWeekLabel', () => {
  it('formats a week start as readable date', () => {
    expect(formatWeekLabel('2026-04-27')).toBe('April 27, 2026')
  })

  it('formats single-digit days without leading zero', () => {
    expect(formatWeekLabel('2026-05-04')).toBe('May 4, 2026')
  })
})
