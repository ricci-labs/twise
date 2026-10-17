import { formatDay, formatDayOfMonth, formatTime } from '@web/lib/format/date'
import { describe, expect, it } from 'vitest'

describe('formatDay', () => {
  it('writes the calendar day of an instant in São Paulo', () => {
    expect(formatDay('2026-10-12T15:00:00.000Z')).toBe('12/10/2026')
  })

  it('takes the day of São Paulo, not of UTC, near midnight', () => {
    expect(formatDay('2026-10-13T01:30:00.000Z')).toBe('12/10/2026')
  })
})

describe('formatDayOfMonth', () => {
  it('writes the day and month of an instant in São Paulo', () => {
    expect(formatDayOfMonth('2026-10-13T01:30:00.000Z')).toBe('12/10')
  })
})

describe('formatTime', () => {
  it('writes the hour and minutes of an instant in São Paulo, on a 24-hour clock', () => {
    expect(formatTime('2026-10-20T17:32:00.000Z')).toBe('14:32')
    expect(formatTime('2026-10-20T03:05:00.000Z')).toBe('00:05')
  })
})
