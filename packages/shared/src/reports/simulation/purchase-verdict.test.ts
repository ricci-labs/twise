import { purchaseVerdictOf } from '@shared/reports/simulation/purchase-verdict'
import type { ComingPeriodImpact } from '@shared/reports/simulation/simulation.types'
import { describe, expect, it } from 'vitest'

const PERIOD_END = '2026-11-04'

function period(freeToSpendBefore: number, freeToSpendAfter: number) {
  return {
    label: '2026-10',
    freeToSpendBefore,
    freeToSpendAfter,
    dailyAllowanceBefore: null,
    dailyAllowanceAfter: null,
  }
}

function month(
  label: string,
  percentOfIncomeBefore: number,
  percentOfIncomeAfter: number,
): ComingPeriodImpact {
  return {
    label,
    committedBefore: percentOfIncomeBefore * 1_000,
    committedAfter: percentOfIncomeAfter * 1_000,
    percentOfIncomeBefore,
    percentOfIncomeAfter,
  }
}

describe('purchaseVerdictOf', () => {
  it('fits when the period stays positive and no month it touches reaches 70%', () => {
    expect(
      purchaseVerdictOf(period(250_000, 194_000), [month('2026-11', 40, 55)], PERIOD_END),
    ).toEqual({
      verdict: 'fits',
      verdictReason: { code: 'free_left', leftCents: 194_000, until: PERIOD_END },
    })
  })

  it('is tight when a month it touches reaches the 70% line', () => {
    const coming = [month('2026-11', 40, 50), month('2026-12', 60, 70)]
    expect(purchaseVerdictOf(period(250_000, 250_000), coming, PERIOD_END)).toEqual({
      verdict: 'tight',
      verdictReason: { code: 'month_heavily_committed', label: '2026-12', percentOfIncome: 70 },
    })
  })

  it('ignores a month already above the line that the purchase does not touch', () => {
    const coming = [month('2026-11', 85, 85), month('2026-12', 30, 40)]
    expect(purchaseVerdictOf(period(250_000, 250_000), coming, PERIOD_END).verdict).toBe('fits')
  })

  it('is over when the period would go below zero, before looking at the months', () => {
    const coming = [month('2026-11', 60, 120)]
    expect(purchaseVerdictOf(period(40_000, -46_000), coming, PERIOD_END)).toEqual({
      verdict: 'over',
      verdictReason: { code: 'period_overspent', overspentCents: 46_000 },
    })
  })

  it('is over when a month it touches would pass 100% of the fixed income', () => {
    const coming = [month('2026-11', 60, 100), month('2026-12', 60, 101)]
    expect(purchaseVerdictOf(period(250_000, 250_000), coming, PERIOD_END)).toEqual({
      verdict: 'over',
      verdictReason: { code: 'month_overcommitted', label: '2026-12', percentOfIncome: 101 },
    })
  })

  it('is over when the card would pass its limit, before anything else', () => {
    const card = { accountId: 'card', limitCents: 500_000, freeBeforeCents: 20_000 }
    expect(
      purchaseVerdictOf(period(40_000, -46_000), [], PERIOD_END, {
        ...card,
        freeAfterCents: -16_000,
      }),
    ).toEqual({
      verdict: 'over',
      verdictReason: { code: 'card_limit_exceeded', exceededCents: 16_000 },
    })
    expect(
      purchaseVerdictOf(period(250_000, 250_000), [], PERIOD_END, { ...card, freeAfterCents: 0 })
        .verdict,
    ).toBe('fits')
    const noLimit = { ...card, limitCents: null, freeBeforeCents: null, freeAfterCents: null }
    expect(purchaseVerdictOf(period(250_000, 250_000), [], PERIOD_END, noLimit).verdict).toBe(
      'fits',
    )
  })

  it('has no month verdict without a fixed income to compare with', () => {
    const coming = [
      { ...month('2026-11', 0, 0), committedAfter: 9_000, percentOfIncomeAfter: null },
    ]
    expect(purchaseVerdictOf(period(250_000, 250_000), coming, PERIOD_END).verdict).toBe('fits')
  })
})
