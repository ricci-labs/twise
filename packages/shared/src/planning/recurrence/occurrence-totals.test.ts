import { occurrenceTotals } from '@shared/planning/recurrence/occurrence-totals'
import type { TotalableOccurrence } from '@shared/planning/recurrence/recurrence.types'
import { describe, expect, it } from 'vitest'

function occurrence(overrides: Partial<TotalableOccurrence> = {}): TotalableOccurrence {
  return {
    entryType: 'expense',
    status: 'pending',
    isOverdue: false,
    amountCents: 10_000,
    ...overrides,
  }
}

describe('occurrenceTotals', () => {
  it('adds what is left to pay and to receive, as in the period of the design', () => {
    const totals = occurrenceTotals([
      occurrence({ amountCents: 12_000, isOverdue: true }),
      occurrence({ entryType: 'card_purchase', amountCents: 6_990 }),
      occurrence({ amountCents: 18_000 }),
      occurrence({ amountCents: 18_000 }),
      occurrence({ entryType: 'income', amountCents: 80_000 }),
      occurrence({ entryType: 'income', status: 'matched', amountCents: 200_000 }),
      occurrence({ status: 'matched', amountCents: 3_990 }),
      occurrence({ status: 'skipped', amountCents: 18_000 }),
      occurrence({ entryType: 'transfer', amountCents: 60_000 }),
    ])
    expect(totals.toPay).toEqual({ amountCents: 54_990, count: 4, overdueCount: 1 })
    expect(totals.toReceive).toEqual({ amountCents: 80_000, count: 1, overdueCount: 0 })
  })

  it('counts the groups of the list, transfers included', () => {
    const totals = occurrenceTotals([
      occurrence({ isOverdue: true }),
      occurrence({ entryType: 'income', isOverdue: true }),
      occurrence(),
      occurrence({ entryType: 'transfer' }),
      occurrence({ status: 'matched' }),
      occurrence({ entryType: 'transfer', status: 'matched' }),
      occurrence({ status: 'skipped' }),
    ])
    expect(totals.groups).toEqual({ overdue: 2, upcoming: 2, matched: 2, skipped: 1 })
    expect(totals.toReceive.overdueCount).toBe(1)
  })

  it('leaves paid and skipped occurrences out of what is left', () => {
    const totals = occurrenceTotals([
      occurrence({ status: 'matched' }),
      occurrence({ status: 'skipped' }),
    ])
    expect(totals.toPay).toEqual({ amountCents: 0, count: 0, overdueCount: 0 })
  })
})
