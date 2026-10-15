import {
  monthlyEquivalentCents,
  recurrenceSummary,
} from '@shared/planning/recurrence/monthly-equivalent'
import type { SummarizableRecurrence } from '@shared/planning/recurrence/recurrence.types'
import { describe, expect, it } from 'vitest'

function recurrence(overrides: Partial<SummarizableRecurrence> = {}): SummarizableRecurrence {
  return {
    entryType: 'expense',
    amountIsEstimate: false,
    frequency: 'monthly',
    interval: 1,
    monthlyCents: 10_000,
    ...overrides,
  }
}

describe('monthlyEquivalentCents', () => {
  it('keeps a monthly amount', () => {
    expect(monthlyEquivalentCents(210_000, { frequency: 'monthly', interval: 1 })).toBe(210_000)
  })

  it('spreads a weekly amount over 52 weeks a year', () => {
    expect(monthlyEquivalentCents(18_000, { frequency: 'weekly', interval: 1 })).toBe(78_000)
  })

  it('spreads a yearly amount over twelve months', () => {
    expect(monthlyEquivalentCents(120_000, { frequency: 'yearly', interval: 1 })).toBe(10_000)
  })

  it('divides by the interval', () => {
    expect(monthlyEquivalentCents(30_000, { frequency: 'monthly', interval: 3 })).toBe(10_000)
    expect(monthlyEquivalentCents(18_000, { frequency: 'weekly', interval: 2 })).toBe(39_000)
  })

  it('rounds to the nearest cent', () => {
    expect(monthlyEquivalentCents(10_000, { frequency: 'yearly', interval: 7 })).toBe(119)
  })
})

describe('recurrenceSummary', () => {
  it('adds expenses and card purchases as bills, saying when one is an estimate or averaged', () => {
    const summary = recurrenceSummary([
      recurrence({ monthlyCents: 210_000 }),
      recurrence({ entryType: 'card_purchase', monthlyCents: 3_990 }),
      recurrence({ amountIsEstimate: true, monthlyCents: 18_000 }),
      recurrence({ frequency: 'weekly', monthlyCents: 78_000 }),
    ])
    expect(summary.bills).toEqual({
      monthlyCents: 309_990,
      count: 4,
      includesEstimate: true,
      includesAveraged: true,
    })
  })

  it('says nothing is estimated or averaged when every bill is fixed and monthly', () => {
    const { bills } = recurrenceSummary([recurrence(), recurrence()])
    expect(bills.includesEstimate).toBe(false)
    expect(bills.includesAveraged).toBe(false)
  })

  it('counts a monthly bill every other month as averaged', () => {
    expect(recurrenceSummary([recurrence({ interval: 2 })]).bills.includesAveraged).toBe(true)
  })

  it('leaves an estimated income out of fixed income and reports it apart', () => {
    const summary = recurrenceSummary([
      recurrence({ entryType: 'income', monthlyCents: 620_000 }),
      recurrence({ entryType: 'income', monthlyCents: 80_000 }),
      recurrence({ entryType: 'income', amountIsEstimate: true, monthlyCents: 200_000 }),
    ])
    expect(summary.income).toEqual({
      monthlyCents: 700_000,
      count: 2,
      leftOutEstimateCents: 200_000,
      leftOutEstimateCount: 1,
    })
  })

  it('adds the scheduled transfers apart', () => {
    const summary = recurrenceSummary([
      recurrence({ entryType: 'transfer', monthlyCents: 60_000 }),
      recurrence(),
    ])
    expect(summary.transfers).toEqual({ monthlyCents: 60_000, count: 1 })
    expect(summary.bills.count).toBe(1)
  })

  it('answers zeros for no recurrences', () => {
    expect(recurrenceSummary([])).toEqual({
      bills: { monthlyCents: 0, count: 0, includesEstimate: false, includesAveraged: false },
      income: { monthlyCents: 0, count: 0, leftOutEstimateCents: 0, leftOutEstimateCount: 0 },
      transfers: { monthlyCents: 0, count: 0 },
    })
  })
})
