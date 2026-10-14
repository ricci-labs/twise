import { firstOpenInstallment, installmentPlan } from '@shared/ledger/installments/installment-plan'
import { describe, expect, it } from 'vitest'

const CARD_X = { closingDay: 25, dueDay: 4, purchaseOnClosingDayGoesNext: false }
const TODAY = '2026-10-20'

describe('installmentPlan', () => {
  it('puts each installment on its invoice, the first one carrying the rounding cents', () => {
    const plan = installmentPlan({
      purchaseDate: TODAY,
      card: CARD_X,
      totalCents: 100_000,
      count: 3,
      firstInstallment: 1,
      today: TODAY,
    })

    expect(
      plan.map((it) => [it.installmentNo, it.invoice.dueOn, it.amountCents, it.isInvoiceClosed]),
    ).toEqual([
      [1, '2026-11-04', 33_334, false],
      [2, '2026-12-04', 33_333, false],
      [3, '2027-01-04', 33_333, false],
    ])
  })

  it('marks the invoices that already closed and finds the first installment still open', () => {
    const plan = installmentPlan({
      purchaseDate: '2026-09-20',
      card: CARD_X,
      totalCents: 100_000,
      count: 3,
      firstInstallment: 1,
      today: TODAY,
    })

    expect(plan.map((it) => [it.invoice.dueOn, it.isInvoiceClosed])).toEqual([
      ['2026-10-04', true],
      ['2026-11-04', false],
      ['2026-12-04', false],
    ])
    expect(firstOpenInstallment(plan)).toBe(2)
  })

  it('lists only the installments still to come of a purchase in progress', () => {
    const plan = installmentPlan({
      purchaseDate: '2026-07-12',
      card: CARD_X,
      totalCents: 300_000,
      count: 10,
      firstInstallment: 4,
      today: TODAY,
    })

    expect(plan).toHaveLength(7)
    expect(plan[0]).toMatchObject({ installmentNo: 4, amountCents: 30_000 })
    expect(plan[0]?.invoice.dueOn).toBe('2026-11-04')
    expect(plan.at(-1)?.invoice.dueOn).toBe('2027-05-04')
  })

  it('refuses a first installment outside the count', () => {
    const input = {
      purchaseDate: TODAY,
      card: CARD_X,
      totalCents: 1000,
      count: 3,
      today: TODAY,
    }
    expect(() => installmentPlan({ ...input, firstInstallment: 4 })).toThrow(RangeError)
    expect(() => installmentPlan({ ...input, firstInstallment: 0 })).toThrow(RangeError)
  })
})
