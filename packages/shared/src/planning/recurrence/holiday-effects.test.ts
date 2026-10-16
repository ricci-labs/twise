import { holidayDatesBetween } from '@shared/core/calendar/holidays'
import { holidayEffects } from '@shared/planning/recurrence/holiday-effects'
import type { HolidayRecurrence } from '@shared/planning/recurrence/recurrence.types'
import { describe, expect, it } from 'vitest'

const FINADOS = '2026-11-02'
const HOLIDAYS = holidayDatesBetween('2026-01-01', '2027-12-31')

function monthly(
  recurrenceId: string,
  schedule: Partial<HolidayRecurrence['schedule']>,
): HolidayRecurrence {
  return {
    recurrenceId,
    description: recurrenceId,
    schedule: {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: null,
      nthBusinessDay: null,
      weekendRule: 'keep',
      startsOn: '2026-01-01',
      endsOn: null,
      ...schedule,
    },
  }
}

describe('holidayEffects', () => {
  it('moves a bill on the first business day to the next one', () => {
    expect(
      holidayEffects([monthly('Vale-alimentação', { nthBusinessDay: 1 })], FINADOS, HOLIDAYS),
    ).toEqual([
      {
        recurrenceId: 'Vale-alimentação',
        description: 'Vale-alimentação',
        fromOn: '2026-11-02',
        toOn: '2026-11-03',
      },
    ])
  })

  it('moves a bill whose day falls on the holiday when it is pushed to a business day', () => {
    expect(
      holidayEffects(
        [monthly('Internet', { dayOfMonth: 2, weekendRule: 'next_business_day' })],
        FINADOS,
        HOLIDAYS,
      ),
    ).toEqual([expect.objectContaining({ fromOn: '2026-11-02', toOn: '2026-11-03' })])
  })

  it('changes nothing for a bill that keeps its date or falls on another day', () => {
    expect(
      holidayEffects(
        [monthly('Aluguel', { dayOfMonth: 2 }), monthly('Luz', { dayOfMonth: 20 })],
        FINADOS,
        HOLIDAYS,
      ),
    ).toEqual([])
  })

  it('changes nothing when the holiday falls on a weekend', () => {
    expect(
      holidayEffects(
        [monthly('Academia', { dayOfMonth: 15, weekendRule: 'next_business_day' })],
        '2026-11-15',
        HOLIDAYS,
      ),
    ).toEqual([])
  })

  it('counts a holiday the workspace is about to add', () => {
    expect(
      holidayEffects([monthly('Diarista', { nthBusinessDay: 1 })], '2026-12-01', HOLIDAYS),
    ).toEqual([expect.objectContaining({ fromOn: '2026-12-01', toOn: '2026-12-02' })])
  })
})
