import { benefitBalances } from '@shared/reports/metrics/benefit-balances'
import type {
  FactOccurrence,
  FactPosting,
  PeriodFacts,
} from '@shared/reports/metrics/metrics.types'
import { describe, expect, it } from 'vitest'

const VOUCHER = 'meal-voucher'

function moved(amountCents: number, effectiveOn: string): FactPosting {
  return { accountId: VOUCHER, amountCents, effectiveOn, occurredOn: effectiveOn }
}

function credit(dueOn: string, status: FactOccurrence['status'] = 'pending'): FactOccurrence {
  return {
    id: `credit-${dueOn}`,
    description: 'VR',
    sourceAccountId: VOUCHER,
    dueOn,
    amountCents: 100_000,
    entryType: 'income',
    status,
    categoryAccountId: 'voucher-income',
    paidOn: null,
  }
}

function facts(overrides: Partial<PeriodFacts> = {}): PeriodFacts {
  return {
    today: '2026-10-15',
    period: { label: '2026-10', start: '2026-10-01', end: '2026-10-31' },
    recentPeriods: [],
    upcomingPeriods: [],
    installmentBudgetView: 'per_installment',
    budgetBase: 'fixed_income',
    accounts: [
      { id: VOUCHER, parentId: null, kind: 'benefit', class: 'asset', incomeNature: null },
      { id: 'checking', parentId: null, kind: 'checking', class: 'asset', incomeNature: null },
    ],
    postings: [
      moved(100_000, '2026-10-06'),
      moved(-20_000, '2026-10-08'),
      moved(-15_000, '2026-10-14'),
    ],
    occurrences: [credit('2026-10-06', 'matched'), credit('2026-11-06')],
    budgets: [],
    goals: [],
    cards: [],
    invoices: [],
    allocation: null,
    balances: [{ accountId: VOUCHER, balanceCents: 65_000 }],
    contactBalances: [],
    ...overrides,
  }
}

describe('benefitBalances', () => {
  it('says what is left, the daily pace since the last credit, and the next credit', () => {
    expect(benefitBalances(facts())).toEqual([
      {
        accountId: VOUCHER,
        balanceCents: 65_000,
        spentSince: '2026-10-06',
        spentCents: 35_000,
        dailySpendCents: 3500,
        lastsUntil: '2026-11-02',
        nextCredit: { dueOn: '2026-11-06', amountCents: 100_000 },
      },
    ])
  })

  it('counts from the period start when no credit came yet, and leaves future moves out', () => {
    const [voucher] = benefitBalances(
      facts({
        postings: [moved(-15_000, '2026-10-05'), moved(-9000, '2026-10-20')],
        balances: [{ accountId: VOUCHER, balanceCents: 21_000 }],
      }),
    )
    expect(voucher).toMatchObject({
      balanceCents: 30_000,
      spentSince: '2026-10-01',
      spentCents: 15_000,
      dailySpendCents: 1000,
      lastsUntil: '2026-11-14',
    })
  })

  it('has no end date without spending or without balance, nor a credit without its income', () => {
    const [idle] = benefitBalances(
      facts({ postings: [moved(100_000, '2026-10-06')], occurrences: [] }),
    )
    expect(idle).toMatchObject({ dailySpendCents: 0, lastsUntil: null, nextCredit: null })
    const [empty] = benefitBalances(facts({ balances: [{ accountId: VOUCHER, balanceCents: 0 }] }))
    expect(empty?.lastsUntil).toBeNull()
  })

  it('skips a credit the household skipped', () => {
    const [voucher] = benefitBalances(
      facts({ occurrences: [credit('2026-11-06', 'skipped'), credit('2026-12-06')] }),
    )
    expect(voucher?.nextCredit).toEqual({ dueOn: '2026-12-06', amountCents: 100_000 })
  })

  it('lists nothing when the household has no benefit account', () => {
    expect(benefitBalances(facts({ accounts: [] }))).toEqual([])
  })
})
