import type { FactOccurrence, PeriodFacts } from '@shared/reports/metrics/metrics.types'
import { simulatePurchase, withPurchase } from '@shared/reports/simulation/simulation'
import { purchaseSimulationQuerySchema } from '@shared/reports/simulation/simulation.schemas'
import { describe, expect, it } from 'vitest'

const CARD = {
  accountId: 'card',
  paymentAccountId: 'checking',
  limitCents: 500_000,
  closingDay: 3,
  dueDay: 10,
  purchaseOnClosingDayGoesNext: true,
}

function occurrence(overrides: Partial<FactOccurrence>): FactOccurrence {
  return {
    id: crypto.randomUUID(),
    description: 'Bill',
    sourceAccountId: 'checking',
    dueOn: '2026-11-05',
    amountCents: 400_000,
    entryType: 'income',
    status: 'pending',
    paidOn: null,
    categoryAccountId: 'salary',
    ...overrides,
  }
}

function household(overrides: Partial<PeriodFacts> = {}): PeriodFacts {
  return {
    today: '2026-10-15',
    period: { label: '2026-10', start: '2026-10-01', end: '2026-10-31' },
    recentPeriods: [],
    upcomingPeriods: [
      { label: '2026-11', start: '2026-11-01', end: '2026-11-30' },
      { label: '2026-12', start: '2026-12-01', end: '2026-12-31' },
    ],
    installmentBudgetView: 'per_installment',
    budgetBase: 'fixed_income',
    accounts: [
      { id: 'checking', parentId: null, kind: 'checking', class: 'asset', incomeNature: null },
      {
        id: 'salary',
        parentId: null,
        kind: 'income_category',
        class: 'income',
        incomeNature: 'fixed',
      },
      {
        id: 'housing',
        parentId: null,
        kind: 'expense_category',
        class: 'expense',
        incomeNature: null,
      },
    ],
    postings: [
      {
        accountId: 'salary',
        amountCents: -400_000,
        effectiveOn: '2026-10-05',
        occurredOn: '2026-10-05',
      },
    ],
    occurrences: [
      occurrence({ dueOn: '2026-11-05' }),
      occurrence({ dueOn: '2026-12-05' }),
      occurrence({
        dueOn: '2026-11-10',
        amountCents: 200_000,
        entryType: 'expense',
        categoryAccountId: 'housing',
      }),
    ],
    budgets: [],
    goals: [],
    cards: [CARD],
    invoices: [],
    allocation: null,
    balances: [{ accountId: 'checking', balanceCents: 300_000 }],
    contactBalances: [],
    ...overrides,
  }
}

const TV_IN_THREE = {
  amountCents: 300_000,
  installmentCount: 3,
  occurredOn: '2026-10-15',
  card: CARD,
  paidFromAccountId: null,
}

describe('simulatePurchase', () => {
  it('shows an installment purchase landing on the coming months, not on this one', () => {
    const impact = simulatePurchase(household(), TV_IN_THREE)
    expect(impact.period).toEqual({
      label: '2026-10',
      start: '2026-10-01',
      end: '2026-10-31',
      freeToSpendBefore: 400_000,
      freeToSpendAfter: 400_000,
      dailyAllowanceBefore: Math.floor(400_000 / 17),
      dailyAllowanceAfter: Math.floor(400_000 / 17),
    })
    expect(impact.coming).toEqual([
      {
        label: '2026-11',
        committedBefore: 200_000,
        committedAfter: 300_000,
        percentOfIncomeBefore: 50,
        percentOfIncomeAfter: 75,
      },
      {
        label: '2026-12',
        committedBefore: 0,
        committedAfter: 100_000,
        percentOfIncomeBefore: 0,
        percentOfIncomeAfter: 25,
      },
    ])
    expect(impact.newInsights).toEqual([
      {
        code: 'period_heavily_committed',
        severity: 'warning',
        subject: '2026-11',
        values: { percentOfIncome: 75, committedCents: 300_000 },
      },
    ])
  })

  it('gives the verdict and the 70% line the months are drawn against', () => {
    const impact = simulatePurchase(household(), TV_IN_THREE)
    expect(impact).toMatchObject({
      verdict: 'tight',
      verdictReason: { code: 'month_heavily_committed', label: '2026-11', percentOfIncome: 75 },
      committedReferencePercent: 70,
    })
    const small = simulatePurchase(household(), { ...TV_IN_THREE, amountCents: 30_000 })
    expect(small).toMatchObject({
      verdict: 'fits',
      verdictReason: { code: 'free_left', leftCents: 400_000, until: '2026-10-31' },
    })
  })

  it('shows the card free limit before and after, and alerts when the purchase passes it', () => {
    const owing = household({ balances: [{ accountId: 'card', balanceCents: -100_000 }] })
    const impact = simulatePurchase(owing, TV_IN_THREE)
    expect(impact.card).toEqual({
      accountId: 'card',
      limitCents: 500_000,
      freeBeforeCents: 400_000,
      freeAfterCents: 100_000,
    })
    expect(impact.account).toBeNull()

    const tooBig = simulatePurchase(owing, { ...TV_IN_THREE, amountCents: 450_000 })
    expect(tooBig).toMatchObject({
      card: { freeAfterCents: -50_000 },
      verdict: 'over',
      verdictReason: { code: 'card_limit_exceeded', exceededCents: 50_000 },
    })
    expect(tooBig.newInsights).toContainEqual({
      code: 'card_limit_exceeded',
      severity: 'alert',
      subject: 'card',
      values: { limitCents: 500_000, exceededCents: 50_000 },
    })
  })

  it('shows the account balance today before and after, unchanged for a later date', () => {
    const fromChecking = {
      amountCents: 50_000,
      installmentCount: 1,
      occurredOn: '2026-10-15',
      card: null,
      paidFromAccountId: 'checking',
    }
    const today = simulatePurchase(household(), fromChecking)
    expect(today.account).toEqual({
      accountId: 'checking',
      balanceTodayBeforeCents: 300_000,
      balanceTodayAfterCents: 250_000,
    })
    expect(today.card).toBeNull()
    const later = simulatePurchase(household(), { ...fromChecking, occurredOn: '2026-10-20' })
    expect(later.account).toMatchObject({
      balanceTodayBeforeCents: 300_000,
      balanceTodayAfterCents: 300_000,
    })
  })

  it('says which period the purchase lands in, by the same rule the metrics count it', () => {
    const november = { label: '2026-11', start: '2026-11-01', end: '2026-11-30' }
    expect(simulatePurchase(household(), TV_IN_THREE)).toMatchObject({
      landsIn: november,
      affectsCurrentPeriod: false,
    })
    const byPurchaseMonth = household({ installmentBudgetView: 'purchase_month' })
    expect(simulatePurchase(byPurchaseMonth, TV_IN_THREE)).toMatchObject({
      landsIn: { label: '2026-10' },
      affectsCurrentPeriod: true,
    })
    const fromChecking = { ...TV_IN_THREE, installmentCount: 1, card: null }
    const later = { ...fromChecking, paidFromAccountId: 'checking', occurredOn: '2026-11-20' }
    expect(simulatePurchase(household(), later)).toMatchObject({
      landsIn: november,
      affectsCurrentPeriod: false,
    })
    expect(simulatePurchase(household(), { ...later, occurredOn: '2027-06-01' })).toMatchObject({
      landsIn: null,
      affectsCurrentPeriod: false,
    })
  })

  it('counts the whole purchase now when the household budgets by purchase month', () => {
    const impact = simulatePurchase(
      household({ installmentBudgetView: 'purchase_month' }),
      TV_IN_THREE,
    )
    expect(impact.period.freeToSpendAfter).toBe(100_000)
  })

  it('takes a debit purchase from the account today, warning when it would go negative', () => {
    const impact = simulatePurchase(household(), {
      amountCents: 350_000,
      installmentCount: 1,
      occurredOn: '2026-10-15',
      card: null,
      paidFromAccountId: 'checking',
    })
    expect(impact.period.freeToSpendAfter).toBe(50_000)
    expect(impact.newInsights).toContainEqual({
      code: 'balance_going_negative',
      severity: 'alert',
      subject: 'checking',
      values: { lowestCents: -50_000, lowestOn: '2026-10-15' },
    })
  })

  it('moves a later debit purchase on its own date', () => {
    const impact = simulatePurchase(household(), {
      amountCents: 350_000,
      installmentCount: 1,
      occurredOn: '2026-10-20',
      card: null,
      paidFromAccountId: 'checking',
    })
    expect(impact.newInsights).toContainEqual(
      expect.objectContaining({
        code: 'balance_going_negative',
        values: { lowestCents: -50_000, lowestOn: '2026-10-20' },
      }),
    )
  })

  it('reports only the alerts the purchase would bring, not the ones already there', () => {
    const base = household()
    const withOverdueBill = household({
      occurrences: [
        ...base.occurrences,
        occurrence({
          dueOn: '2026-10-10',
          amountCents: 1_000,
          entryType: 'expense',
          categoryAccountId: 'housing',
        }),
      ],
    })
    const codes = simulatePurchase(withOverdueBill, TV_IN_THREE).newInsights.map(
      (insight) => insight.code,
    )
    expect(codes).toEqual(['period_heavily_committed'])
  })

  it('adds to an invoice that already has purchases', () => {
    const withInvoice = household({
      invoices: [
        {
          cardAccountId: 'card',
          closingOn: '2026-11-03',
          dueOn: '2026-11-10',
          totalCents: 50_000,
          paidCents: 0,
          frontedCents: 0,
        },
      ],
      today: '2026-10-15',
    })
    const impact = simulatePurchase(withInvoice, {
      ...TV_IN_THREE,
      installmentCount: 1,
      amountCents: 60_000,
    })
    expect(impact.coming[0]?.committedAfter).toBe(260_000)
    expect(withPurchase(withInvoice, TV_IN_THREE).invoices).toEqual([
      {
        cardAccountId: 'card',
        closingOn: '2026-11-03',
        dueOn: '2026-11-10',
        totalCents: 150_000,
        paidCents: 0,
        frontedCents: 0,
      },
      {
        cardAccountId: 'card',
        closingOn: '2026-12-03',
        dueOn: '2026-12-10',
        totalCents: 100_000,
        paidCents: 0,
        frontedCents: 0,
      },
      {
        cardAccountId: 'card',
        closingOn: '2027-01-03',
        dueOn: '2027-01-10',
        totalCents: 100_000,
        paidCents: 0,
        frontedCents: 0,
      },
    ])
  })
})

describe('purchaseSimulationQuerySchema', () => {
  const ID = '01900000-0000-7000-8000-000000000001'

  it('needs either a card or an account, and installments only on a card', () => {
    expect(
      purchaseSimulationQuerySchema.safeParse({ amountCents: '100', cardAccountId: ID }).success,
    ).toBe(true)
    expect(purchaseSimulationQuerySchema.safeParse({ amountCents: '100' }).success).toBe(false)
    expect(
      purchaseSimulationQuerySchema.safeParse({
        amountCents: '100',
        cardAccountId: ID,
        paidFromAccountId: ID,
      }).success,
    ).toBe(false)
    expect(
      purchaseSimulationQuerySchema.safeParse({
        amountCents: '100',
        paidFromAccountId: ID,
        installmentCount: '2',
      }).success,
    ).toBe(false)
  })

  it('refuses more installments than cents, since each needs at least one', () => {
    const onCard = (amountCents: string, installmentCount: string) =>
      purchaseSimulationQuerySchema.safeParse({ amountCents, installmentCount, cardAccountId: ID })
        .success
    expect(onCard('5', '10')).toBe(false)
    expect(onCard('10', '10')).toBe(true)
  })
})
