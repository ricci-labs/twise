import { computeMetrics } from '@shared/reports/metrics/metrics'
import type { FactAccount, FactPosting, PeriodFacts } from '@shared/reports/metrics/metrics.types'
import { describe, expect, it } from 'vitest'

const OCTOBER = { label: '2026-10', start: '2026-10-05', end: '2026-11-04' }
const RECENT = [
  { label: '2026-07', start: '2026-07-05', end: '2026-08-04' },
  { label: '2026-08', start: '2026-08-05', end: '2026-09-04' },
  { label: '2026-09', start: '2026-09-05', end: '2026-10-04' },
]

function category(id: string, parentId: string | null = null): FactAccount {
  return { id, parentId, kind: 'expense_category', class: 'expense', incomeNature: null }
}

function spentOn(accountId: string, amountCents: number, on: string): FactPosting[] {
  return [
    { accountId, amountCents, effectiveOn: on, occurredOn: on },
    { accountId: 'checking', amountCents: -amountCents, effectiveOn: on, occurredOn: on },
  ]
}

function household(overrides: Partial<PeriodFacts> = {}): PeriodFacts {
  return {
    today: '2026-10-20',
    period: OCTOBER,
    recentPeriods: RECENT,
    upcomingPeriods: [],
    installmentBudgetView: 'per_installment',
    budgetBase: 'fixed_income',
    accounts: [
      { id: 'checking', parentId: null, kind: 'checking', class: 'asset', incomeNature: null },
      category('groceries'),
      category('market', 'groceries'),
      category('bakery', 'groceries'),
      category('leisure'),
      category('gifts'),
      category('travel'),
      category('health'),
      category('pharmacy', 'health'),
    ],
    postings: [
      ...spentOn('groceries', 51_500, '2026-10-08'),
      ...spentOn('market', 21_000, '2026-10-09'),
      ...spentOn('bakery', 9_500, '2026-10-10'),
      ...spentOn('leisure', 46_000, '2026-10-11'),
      ...spentOn('gifts', 14_500, '2026-10-12'),
      ...spentOn('pharmacy', 9_000, '2026-10-13'),
      ...spentOn('gifts', 10_000, '2026-07-10'),
      ...spentOn('gifts', 8_800, '2026-08-10'),
      ...spentOn('gifts', 10_000, '2026-09-10'),
      ...spentOn('groceries', 115_000, '2026-09-12'),
    ],
    occurrences: [],
    budgets: [
      { categoryAccountId: 'groceries', limitCents: 120_000 },
      { categoryAccountId: 'leisure', limitCents: 40_000 },
      { categoryAccountId: 'pharmacy', limitCents: 30_000 },
    ],
    goals: [],
    cards: [],
    invoices: [],
    allocation: null,
    balances: [],
    contactBalances: [],
    ...overrides,
  }
}

describe('budgetPace by subcategory', () => {
  it('splits what a budget spent into the parent itself and each subcategory, largest first', () => {
    const [groceries] = computeMetrics(household()).budgetPace
    expect(groceries).toMatchObject({
      spentCents: 82_000,
      directCents: 51_500,
      children: [
        { categoryAccountId: 'market', spentCents: 21_000 },
        { categoryAccountId: 'bakery', spentCents: 9_500 },
      ],
    })
  })

  it('leaves out the subcategories with nothing spent', () => {
    const [, leisure] = computeMetrics(
      household({ accounts: [...household().accounts, category('cinema', 'leisure')] }),
    ).budgetPace
    expect(leisure).toMatchObject({ directCents: 46_000, children: [] })
  })
})

describe('budgetTotals', () => {
  it('adds the limits, the spending and the pace of every budget, counting those off pace', () => {
    expect(computeMetrics(household()).budgetTotals).toEqual({
      count: 3,
      limitCents: 190_000,
      spentCents: 137_000,
      expectedCents: 98_064,
      usedPercent: 72,
      offPaceCount: 2,
    })
  })

  it('answers zeros without budgets', () => {
    expect(computeMetrics(household({ budgets: [] })).budgetTotals).toEqual({
      count: 0,
      limitCents: 0,
      spentCents: 0,
      expectedCents: 0,
      usedPercent: 0,
      offPaceCount: 0,
    })
  })
})

describe('unbudgetedSpending', () => {
  it('lists the top categories without a budget that spent in the period, largest first', () => {
    const facts = household({
      postings: [...household().postings, ...spentOn('travel', 30_000, '2026-10-14')],
    })
    expect(computeMetrics(facts).unbudgetedSpending).toEqual([
      { categoryAccountId: 'travel', spentCents: 30_000 },
      { categoryAccountId: 'gifts', spentCents: 14_500 },
    ])
  })

  it('leaves out what a subcategory budget already covers', () => {
    const facts = household({
      postings: [...household().postings, ...spentOn('health', 4_000, '2026-10-15')],
    })
    expect(computeMetrics(facts).unbudgetedSpending).toContainEqual({
      categoryAccountId: 'health',
      spentCents: 4_000,
    })
  })
})

describe('categoryAverages', () => {
  it('averages each category over the last three periods with activity, subcategories included', () => {
    const { periods, lines } = computeMetrics(household()).categoryAverages
    expect(periods).toBe(3)
    expect(lines).toEqual([
      { categoryAccountId: 'groceries', averageCents: 38_333 },
      { categoryAccountId: 'gifts', averageCents: 9_600 },
    ])
  })

  it('answers no periods when nothing happened before', () => {
    const facts = household({ postings: household().postings.slice(0, 12) })
    expect(computeMetrics(facts).categoryAverages).toEqual({ periods: 0, lines: [] })
  })
})
