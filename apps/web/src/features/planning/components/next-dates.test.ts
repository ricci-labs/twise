import type { RecurrenceSchedule } from '@financas/shared'
import {
  nextDatesOf,
  plannedPreviewOf,
  yearsOf,
} from '@web/features/planning/components/next-dates'
import {
  blankRecurrence,
  newRuleOf,
  scheduleOf,
} from '@web/features/planning/components/recurrence-input'
import { describe, expect, it } from 'vitest'

const TODAY = '2026-10-20'
const AMOUNT = { amountCents: 9990, isEstimate: false }

function monthly(overrides: Partial<RecurrenceSchedule>): RecurrenceSchedule {
  return {
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: 10,
    nthBusinessDay: null,
    weekendRule: 'next_business_day',
    startsOn: '2026-11-10',
    endsOn: null,
    ...overrides,
  }
}

function preview(schedule: RecurrenceSchedule, holidays: readonly string[] = []) {
  return nextDatesOf(plannedPreviewOf(schedule, TODAY, holidays), schedule, AMOUNT).map(
    ({ date, weekday, note }) => [date, weekday, note ?? ''].join(' | '),
  )
}

describe('next dates preview', () => {
  it('shows the next three dates with the weekday, and why one moved off a weekend', () => {
    expect(preview(monthly({}))).toEqual([
      '10/11 | ter | ',
      '10/12 | qui | ',
      '11/01 | seg | dia 10 é domingo, foi para segunda',
    ])
  })

  it('says a national or a workspace holiday moved a date, either way', () => {
    expect(preview(monthly({ dayOfMonth: 2, startsOn: '2026-11-02' }))[0]).toBe(
      '03/11 | ter | dia 2 é feriado, foi para terça',
    )
    expect(
      preview(
        monthly({ dayOfMonth: 15, startsOn: '2026-12-01', weekendRule: 'previous_business_day' }),
        ['2026-12-15'],
      )[0],
    ).toBe('14/12 | seg | dia 15 é feriado, foi para segunda')
  })

  it('names the business day, and says when a holiday came before it', () => {
    expect(
      preview(monthly({ dayOfMonth: null, nthBusinessDay: 1, startsOn: '2026-11-01' })),
    ).toEqual([
      '03/11 | ter | 1º dia útil, depois do feriado',
      '01/12 | ter | 1º dia útil',
      '04/01 | seg | 1º dia útil, depois do feriado',
    ])
  })

  it('repeats the weekday of the first date every week, with nothing to explain', () => {
    const weekly = monthly({ frequency: 'weekly', dayOfMonth: null, startsOn: '2026-10-23' })
    expect(preview(weekly)).toEqual(['23/10 | sex | ', '30/10 | sex | ', '06/11 | sex | '])
  })

  it('starts today when the first date is already past, and stops at the end date', () => {
    const past = monthly({ startsOn: '2026-09-10', endsOn: '2026-12-31' })
    expect(preview(past)).toEqual(['10/11 | ter | ', '10/12 | qui | '])
  })

  it('marks every amount as an estimate when it changes every month', () => {
    const [first] = nextDatesOf(plannedPreviewOf(monthly({}), TODAY), monthly({}), {
      amountCents: 18000,
      isEstimate: true,
    })
    expect(first).toMatchObject({ amountCents: 18000, isEstimate: true })
  })

  it('lists the years the dates fall in, to ask for their holidays', () => {
    expect(yearsOf(plannedPreviewOf(monthly({}), TODAY))).toEqual([2026, 2027])
  })
})

describe('new recurrence body', () => {
  it('sends the day of the month, or the business day with the date kept, never both', () => {
    const blank = { ...blankRecurrence('expense', TODAY), description: 'Academia', amount: '99,90' }
    expect(scheduleOf(blank)).toMatchObject({ dayOfMonth: 20, nthBusinessDay: null })
    expect(
      scheduleOf({ ...blank, dayRule: 'businessDay', weekendRule: 'next_business_day' }),
    ).toMatchObject({ dayOfMonth: null, nthBusinessDay: 5, weekendRule: 'keep' })
    expect(scheduleOf({ ...blank, dayRule: 'sameDay' })).toMatchObject({
      dayOfMonth: null,
      nthBusinessDay: null,
    })
  })

  it('drops the day rule for a weekly one and the end date when there is none', () => {
    const weekly = {
      ...blankRecurrence('income', TODAY),
      frequency: 'weekly' as const,
      dayRule: 'businessDay' as const,
      endsOn: '2027-01-01',
    }
    expect(scheduleOf(weekly)).toMatchObject({
      dayOfMonth: null,
      nthBusinessDay: null,
      endsOn: null,
    })
    expect(scheduleOf({ ...weekly, hasEnd: true }).endsOn).toBe('2027-01-01')
  })

  it('turns the typed amount into cents, with no reminder and no auto record', () => {
    const values = {
      ...blankRecurrence('expense', TODAY),
      description: 'Academia',
      amount: '99,90',
      sourceAccountId: 'source',
      categoryAccountId: 'category',
    }
    expect(newRuleOf(values)).toMatchObject({
      amountCents: 9990,
      remindDaysBefore: null,
      autoRecord: false,
    })
  })
})
