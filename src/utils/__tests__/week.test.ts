import { getWeekStart, getCurrentWeekStart } from '../week'

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
