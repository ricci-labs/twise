import {
  formatDayMonth,
  formatDayMonthLong,
  formatFullDate,
  formatMonthLabel,
  formatMonthName,
  formatRange,
  formatShortDate,
  formatWeekday,
} from '@web/lib/format/calendar'
import { describe, expect, it } from 'vitest'

describe('calendar formats', () => {
  it('writes calendar days the way the Home design does', () => {
    expect(formatDayMonth('2026-10-20')).toBe('20 out')
    expect(formatDayMonthLong('2026-10-20')).toBe('20 de outubro')
    expect(formatShortDate('2026-11-04')).toBe('04/11')
    expect(formatFullDate('2026-10-18')).toBe('18/10/2026')
    expect(formatRange('2026-10-05', '2026-11-04')).toBe('5 out – 4 nov')
  })

  it('names periods by their month and the days of the week', () => {
    expect(formatMonthLabel('2027-01')).toBe('jan/27')
    expect(formatMonthName('2026-09')).toBe('setembro')
    expect(formatWeekday('2026-10-22')).toBe('Quinta')
  })
})
