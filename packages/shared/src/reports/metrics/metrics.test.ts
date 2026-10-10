import { computeMetrics } from '@shared/reports/metrics/metrics'
import type { FactPosting, PeriodFacts } from '@shared/reports/metrics/metrics.types'
import { describe, expect, it } from 'vitest'

const OCTOBER = { label: '2026-10', start: '2026-10-01', end: '2026-10-31' }
const RECENT = ['04', '05', '06', '07', '08', '09'].map((month) => ({
  label: `2026-${month}`,
  start: `2026-${month}-01`,
  end: `2026-${month}-${month === '04' || month === '06' || month === '09' ? '30' : '31'}`,
}))

function moved(
  accountId: string,
  amountCents: number,
  effectiveOn: string,
  occurredOn = effectiveOn,
): FactPosting {
  return { accountId, amountCents, effectiveOn, occurredOn }
}

function household(overrides: Partial<PeriodFacts> = {}): PeriodFacts {
  return {
    today: '2026-10-15',
    period: OCTOBER,
    recentPeriods: RECENT,
    upcomingPeriods: [
      { label: '2026-11', start: '2026-11-01', end: '2026-11-30' },
      { label: '2026-12', start: '2026-12-01', end: '2026-12-31' },
    ],
    installmentBudgetView: 'per_installment',
    budgetBase: 'fixed_income',
    accounts: [
      { id: 'checking', parentId: null, kind: 'checking', class: 'asset', incomeNature: null },
      {
        id: 'salary-a',
        parentId: null,
        kind: 'income_category',
        class: 'income',
        incomeNature: 'fixed',
      },
      {
        id: 'salary-b',
        parentId: null,
        kind: 'income_category',
        class: 'income',
        incomeNature: 'fixed',
      },
      {
        id: 'commission',
        parentId: null,
        kind: 'income_category',
        class: 'income',
        incomeNature: 'variable',
      },
      {
        id: 'food',
        parentId: null,
        kind: 'expense_category',
        class: 'expense',
        incomeNature: null,
      },
      {
        id: 'groceries',
        parentId: 'food',
        kind: 'expense_category',
        class: 'expense',
        incomeNature: null,
      },
      {
        id: 'housing',
        parentId: null,
        kind: 'expense_category',
        class: 'expense',
        incomeNature: null,
      },
      {
        id: 'electronics',
        parentId: null,
        kind: 'expense_category',
        class: 'expense',
        incomeNature: null,
      },
      { id: 'card', parentId: null, kind: 'credit_card', class: 'liability', incomeNature: null },
    ],
    postings: [
      moved('commission', -100_000, '2026-08-05'),
      moved('checking', 100_000, '2026-08-05'),
      moved('groceries', 40_000, '2026-08-10'),
      moved('checking', -40_000, '2026-08-10'),
      moved('checking', 500_000, '2026-10-05'),
      moved('salary-a', -500_000, '2026-10-05'),
      moved('checking', 120_000, '2026-10-10'),
      moved('commission', -120_000, '2026-10-10'),
      moved('groceries', 30_000, '2026-10-12'),
      moved('checking', -30_000, '2026-10-12'),
      moved('electronics', 30_000, '2026-09-20', '2026-09-20'),
      moved('electronics', 30_000, '2026-10-20', '2026-09-20'),
      moved('electronics', 30_000, '2026-11-20', '2026-09-20'),
      moved('card', -90_000, '2026-09-20', '2026-09-20'),
    ],
    occurrences: [
      {
        id: 'occurrence-1',
        description: 'Bill',
        sourceAccountId: 'checking',
        dueOn: '2026-10-20',
        amountCents: 400_000,
        entryType: 'income',
        status: 'pending',
        paidOn: null,
        categoryAccountId: 'salary-b',
      },
      {
        id: 'occurrence-2',
        description: 'Bill',
        sourceAccountId: 'checking',
        dueOn: '2026-10-30',
        amountCents: 100_000,
        entryType: 'income',
        status: 'pending',
        paidOn: null,
        categoryAccountId: 'commission',
      },
      {
        id: 'occurrence-3',
        description: 'Bill',
        sourceAccountId: 'checking',
        dueOn: '2026-10-13',
        amountCents: 200_000,
        entryType: 'expense',
        status: 'pending',
        paidOn: null,
        categoryAccountId: 'housing',
      },
      {
        id: 'occurrence-4',
        description: 'Bill',
        sourceAccountId: 'card',
        dueOn: '2026-10-25',
        amountCents: 4_000,
        entryType: 'card_purchase',
        status: 'pending',
        paidOn: null,
        categoryAccountId: 'electronics',
      },
      {
        id: 'occurrence-5',
        description: 'Bill',
        sourceAccountId: 'checking',
        dueOn: '2026-10-08',
        amountCents: 15_000,
        entryType: 'expense',
        status: 'matched',
        paidOn: null,
        categoryAccountId: 'housing',
      },
      {
        id: 'occurrence-6',
        description: 'Bill',
        sourceAccountId: 'checking',
        dueOn: '2026-10-09',
        amountCents: 9_000,
        entryType: 'expense',
        status: 'skipped',
        paidOn: null,
        categoryAccountId: 'housing',
      },
      {
        id: 'occurrence-7',
        description: 'Bill',
        sourceAccountId: 'checking',
        dueOn: '2026-11-10',
        amountCents: 200_000,
        entryType: 'expense',
        status: 'pending',
        paidOn: null,
        categoryAccountId: 'housing',
      },
      {
        id: 'occurrence-8',
        description: 'Bill',
        sourceAccountId: 'checking',
        dueOn: '2026-11-20',
        amountCents: 400_000,
        entryType: 'income',
        status: 'pending',
        paidOn: null,
        categoryAccountId: 'salary-b',
      },
    ],
    goals: [
      {
        goalId: 'reserve-goal',
        name: 'Reserva',
        accountId: 'savings',
        targetCents: 3_000_000,
        targetOn: null,
        isReserve: true,
        savedCents: 1_200_000,
      },
    ],
    allocation: null,
    cards: [
      {
        accountId: 'card',
        paymentAccountId: 'checking',
        closingDay: 3,
        dueDay: 10,
        purchaseOnClosingDayGoesNext: true,
      },
    ],
    invoices: [
      {
        cardAccountId: 'card',
        closingOn: '2026-10-03',
        dueOn: '2026-10-10',
        totalCents: 30_000,
        paidCents: 30_000,
        frontedCents: 0,
      },
      {
        cardAccountId: 'card',
        closingOn: '2026-11-03',
        dueOn: '2026-11-10',
        totalCents: 45_000,
        paidCents: 10_000,
        frontedCents: 15_000,
      },
    ],
    balances: [{ accountId: 'checking', balanceCents: 600_000 }],
    contactBalances: [],
    budgets: [
      { categoryAccountId: 'food', limitCents: 20_000 },
      { categoryAccountId: 'housing', limitCents: 250_000 },
      { categoryAccountId: 'electronics', limitCents: 40_000 },
    ],
    ...overrides,
  }
}

describe('computeMetrics', () => {
  it('answers how much is still free to spend, per installment', () => {
    expect(computeMetrics(household())).toMatchObject({
      fixedIncome: 900_000,
      variableIncome: 120_000,
      budgetIncome: 900_000,
      spent: 60_000,
      committed: 204_000,
      freeToSpend: 636_000,
      dailyAllowance: 37_411,
    })
  })

  it('counts an installment purchase in the month it was bought, when the household prefers', () => {
    const metrics = computeMetrics(household({ installmentBudgetView: 'purchase_month' }))
    expect([metrics.spent, metrics.freeToSpend]).toEqual([30_000, 666_000])
  })

  it('adds the commission to the budget only when the budget is built on all income', () => {
    expect(computeMetrics(household({ budgetBase: 'all_income' })).budgetIncome).toBe(1_020_000)
  })

  it('spreads what is free over the whole period before it starts, and gives nothing after it', () => {
    expect(computeMetrics(household({ today: '2026-09-20' })).dailyAllowance).toBe(
      Math.floor(636_000 / 31),
    )
    expect(computeMetrics(household({ today: '2026-10-31' })).dailyAllowance).toBe(636_000)
    expect(computeMetrics(household({ today: '2026-11-01' })).dailyAllowance).toBeNull()
  })

  it('never gives a negative allowance when the period is already over budget', () => {
    const overspent = household({
      postings: [...household().postings, moved('groceries', 1_000_000, '2026-10-14')],
    })
    expect(computeMetrics(overspent).freeToSpend).toBe(-364_000)
    expect(computeMetrics(overspent).dailyAllowance).toBe(0)
  })
})

describe('budgetPace', () => {
  it('compares what each budget spent with the share of the period gone, how far over and ahead, a parent covering its children', () => {
    expect(computeMetrics(household()).budgetPace).toEqual([
      {
        categoryAccountId: 'food',
        limitCents: 20_000,
        spentCents: 30_000,
        expectedCents: 9_677,
        overCents: 10_000,
        aheadPoints: 102,
        status: 'over',
      },
      {
        categoryAccountId: 'housing',
        limitCents: 250_000,
        spentCents: 0,
        expectedCents: 120_968,
        overCents: 0,
        aheadPoints: 0,
        status: 'within',
      },
      {
        categoryAccountId: 'electronics',
        limitCents: 40_000,
        spentCents: 30_000,
        expectedCents: 19_355,
        overCents: 0,
        aheadPoints: 27,
        status: 'ahead',
      },
    ])
  })

  it('covers every level below the budgeted category', () => {
    const base = household()
    const withGrandchild = household({
      accounts: [
        {
          id: 'snacks',
          parentId: 'groceries',
          kind: 'expense_category',
          class: 'expense',
          incomeNature: null,
        },
        ...base.accounts,
      ],
      postings: [...base.postings, moved('snacks', 5_000, '2026-10-03')],
      budgets: [{ categoryAccountId: 'food', limitCents: 20_000 }],
    })
    expect(computeMetrics(withGrandchild).budgetPace[0]?.spentCents).toBe(35_000)
  })

  it('expects nothing before the period and the whole limit after it', () => {
    const expected = (today: string) =>
      computeMetrics(household({ today })).budgetPace.map((line) => line.expectedCents)
    expect(expected('2026-09-30')).toEqual([0, 0, 0])
    expect(expected('2026-11-01')).toEqual([20_000, 250_000, 40_000])
  })

  it('is never ahead of pace before the period starts, only over the limit', () => {
    const early = household({ today: '2026-09-30' })
    const statuses = computeMetrics({
      ...early,
      postings: [...early.postings, moved('housing', 300_000, '2026-10-02')],
    }).budgetPace.map((line) => line.status)
    expect(statuses).toEqual(['over', 'over', 'within'])
  })
})

describe('periodProgress', () => {
  it('counts today as elapsed and as left, with the elapsed share in whole percent', () => {
    expect(computeMetrics(household()).periodProgress).toEqual({
      total: 31,
      elapsed: 15,
      left: 17,
      elapsedPercent: 48,
    })
  })

  it('is untouched before the period and complete after it', () => {
    const progress = (today: string) => computeMetrics(household({ today })).periodProgress
    expect(progress('2026-09-30')).toMatchObject({ elapsed: 0, left: 31, elapsedPercent: 0 })
    expect(progress('2026-11-01')).toMatchObject({ elapsed: 31, left: 0, elapsedPercent: 100 })
  })
})

describe('incomeShare', () => {
  it('splits the budget income into spent, committed and free, in whole percent', () => {
    expect(computeMetrics(household()).incomeShare).toEqual({
      spentPercent: 7,
      committedPercent: 23,
      freePercent: 70,
    })
  })

  it('leaves nothing free once spending and bills pass the income', () => {
    const base = household()
    const overspent = household({
      postings: [...base.postings, moved('groceries', 900_000, '2026-10-14')],
    })
    expect(computeMetrics(overspent).incomeShare).toEqual({
      spentPercent: 107,
      committedPercent: 23,
      freePercent: 0,
    })
  })

  it('has no share without budget income', () => {
    expect(computeMetrics(household({ postings: [], occurrences: [] })).incomeShare).toBeNull()
  })
})

describe('periodPace', () => {
  it('compares the income used with the time gone, in points', () => {
    expect(computeMetrics(household()).periodPace).toEqual({
      usedPercent: 30,
      elapsedPercent: 48,
      pointsAhead: -18,
    })
  })

  it('has no pace without budget income', () => {
    expect(computeMetrics(household({ postings: [], occurrences: [] })).periodPace).toBeNull()
  })
})

describe('billsDue', () => {
  it('lists the overdue bills and the ones due in the next seven days, today included', () => {
    const base = household()
    const withBillsAhead = household({
      occurrences: [
        ...base.occurrences,
        {
          id: 'water',
          description: 'Água',
          sourceAccountId: 'checking',
          dueOn: '2026-10-21',
          amountCents: 8_000,
          entryType: 'expense',
          status: 'pending',
          paidOn: null,
          categoryAccountId: 'housing',
        },
        {
          id: 'gas',
          description: 'Gás',
          sourceAccountId: 'checking',
          dueOn: '2026-10-22',
          amountCents: 9_000,
          entryType: 'expense',
          status: 'pending',
          paidOn: null,
          categoryAccountId: 'housing',
        },
      ],
    })
    expect(computeMetrics(withBillsAhead).billsDue).toEqual({
      until: '2026-10-21',
      count: 1,
      totalCents: 8_000,
      overdueCount: 1,
      items: [
        {
          occurrenceId: 'occurrence-3',
          description: 'Bill',
          dueOn: '2026-10-13',
          amountCents: 200_000,
          daysFromToday: -2,
        },
        {
          occurrenceId: 'water',
          description: 'Água',
          dueOn: '2026-10-21',
          amountCents: 8_000,
          daysFromToday: 6,
        },
      ],
    })
  })

  it('leaves out income, card subscriptions and bills already paid or skipped', () => {
    const descriptions = computeMetrics(household({ today: '2026-10-08' })).billsDue.items.map(
      (bill) => bill.occurrenceId,
    )
    expect(descriptions).toEqual(['occurrence-3'])
  })
})

describe('receivables', () => {
  const owing = (
    contactId: string,
    owedCents: number,
    overdueCents: number,
    nextDueOn: string | null,
  ) => ({
    contactId,
    owedCents,
    overdueCents,
    nextDueOn,
    nextDueCents: nextDueOn ? 5_000 : 0,
  })

  it('adds up what contacts owe and points at the next amount to receive', () => {
    const facts = household({
      contactBalances: [
        owing('contact-a', 30_000, 0, '2026-10-30'),
        owing('contact-b', 20_000, 20_000, null),
        owing('contact-c', 10_000, 0, '2026-10-25'),
        owing('settled', 0, 0, null),
      ],
    })
    expect(computeMetrics(facts).receivables).toEqual({
      owedCents: 60_000,
      overdueCents: 20_000,
      contactCount: 3,
      next: { contactId: 'contact-c', dueOn: '2026-10-25', amountCents: 5_000 },
    })
  })

  it('has nothing when nobody owes, and no next one when all is overdue', () => {
    expect(computeMetrics(household()).receivables).toBeNull()
    const overdueOnly = household({ contactBalances: [owing('contact-b', 20_000, 20_000, null)] })
    expect(computeMetrics(overdueOnly).receivables?.next).toBeNull()
  })
})

describe('goalProgress', () => {
  const goal = (goalId: string, targetOn: string | null, savedCents: number) => ({
    goalId,
    name: goalId,
    accountId: `${goalId}-account`,
    targetCents: 100_000,
    targetOn,
    isReserve: false,
    savedCents,
  })

  it('lists the goals with a deadline, soonest first, with their progress capped at 100%', () => {
    const facts = household({
      goals: [
        goal('trip', '2027-03-31', 40_000),
        goal('laptop', '2026-12-31', 150_000),
        goal('someday', null, 1),
      ],
    })
    expect(computeMetrics(facts).goalProgress).toEqual([
      {
        goalId: 'laptop',
        name: 'laptop',
        savedCents: 150_000,
        targetCents: 100_000,
        targetOn: '2026-12-31',
        percent: 100,
      },
      {
        goalId: 'trip',
        name: 'trip',
        savedCents: 40_000,
        targetCents: 100_000,
        targetOn: '2027-03-31',
        percent: 40,
      },
    ])
  })

  it('leaves the reserve out: it has its own card', () => {
    expect(computeMetrics(household()).goalProgress).toEqual([])
  })
})

describe('variableVsAverage', () => {
  it('compares the commission of the period with the average, in whole percent', () => {
    expect(computeMetrics(household()).variableVsAverage).toEqual({ percent: 140 })
  })

  it('has no comparison before the commission arrives or without history', () => {
    const base = household()
    const noCommissionYet = household({
      postings: base.postings.filter(
        (posting) => !(posting.accountId === 'commission' && posting.effectiveOn >= '2026-10-01'),
      ),
    })
    expect(computeMetrics(noCommissionYet).variableVsAverage).toBeNull()
    expect(computeMetrics(household({ recentPeriods: [] })).variableVsAverage).toBeNull()
  })
})

describe('periodSummary', () => {
  const afterOctober = (postings: FactPosting[] = []) => {
    const base = household({ today: '2026-11-02' })
    return household({ today: '2026-11-02', postings: [...base.postings, ...postings] })
  }
  const salaryIn = (month: string, amountCents: number) => [
    moved('salary-a', -amountCents, `2026-${month}-05`),
    moved('checking', amountCents, `2026-${month}-05`),
  ]

  it('has nothing to sum up while the period is open', () => {
    expect(computeMetrics(household()).periodSummary).toBeNull()
  })

  it('tells what was left and counts this period in the streak of positive ones', () => {
    const metrics = computeMetrics(afterOctober())
    expect(metrics.periodSummary).toMatchObject({
      leftCents: metrics.freeToSpend,
      positiveStreak: 1,
      streakCapped: false,
    })
  })

  it('counts the previous periods that also closed positive, back to the first one that did not', () => {
    const summary = computeMetrics(afterOctober(salaryIn('09', 50_000))).periodSummary
    expect(summary).toMatchObject({ positiveStreak: 2, streakCapped: false })
  })

  it('stops at a period with no activity: a new household has no streak behind it', () => {
    const base = household({ today: '2026-11-02' })
    const newHousehold = household({
      today: '2026-11-02',
      postings: base.postings.filter((posting) => posting.effectiveOn >= '2026-10-01'),
    })
    expect(computeMetrics(newHousehold).periodSummary).toMatchObject({ positiveStreak: 1 })
  })

  it('says the streak may be longer when every loaded period closed positive', () => {
    const everyMonth = ['04', '05', '06', '07', '08', '09'].flatMap((month) =>
      salaryIn(month, 50_000),
    )
    expect(computeMetrics(afterOctober(everyMonth)).periodSummary).toMatchObject({
      positiveStreak: 7,
      streakCapped: true,
    })
  })

  it('counts budgets within their limit and bills paid by their due date', () => {
    const base = household({ today: '2026-11-02' })
    const paid = (
      id: string,
      dueOn: string,
      paidOn: string | null,
      status: 'matched' | 'skipped',
    ) => ({
      id,
      description: 'Bill',
      sourceAccountId: 'checking',
      dueOn,
      amountCents: 1_000,
      entryType: 'expense' as const,
      status,
      categoryAccountId: 'housing',
      paidOn,
    })
    const summary = computeMetrics({
      ...base,
      occurrences: [
        ...base.occurrences,
        paid('on-time', '2026-10-10', '2026-10-09', 'matched'),
        paid('late', '2026-10-11', '2026-10-14', 'matched'),
        paid('skipped', '2026-10-12', null, 'skipped'),
      ],
    }).periodSummary
    expect(summary).toMatchObject({ budgetsWithin: 2, budgetsTotal: 3 })
    expect(summary).toMatchObject({ billsOnTime: 1, billsTotal: 4 })
  })

  it('adds up what went into the reserve and how far each goal moved in the period', () => {
    const base = household({ today: '2026-11-02' })
    const summary = computeMetrics({
      ...base,
      goals: [
        ...base.goals,
        {
          goalId: 'trip',
          name: 'Viagem',
          accountId: 'trip-savings',
          targetCents: 100_000,
          targetOn: '2027-03-31',
          isReserve: false,
          savedCents: 50_000,
        },
        {
          goalId: 'idle',
          name: 'Parado',
          accountId: 'idle-savings',
          targetCents: 100_000,
          targetOn: null,
          isReserve: false,
          savedCents: 10_000,
        },
      ],
      postings: [
        ...base.postings,
        moved('savings', 20_000, '2026-10-10'),
        moved('trip-savings', 30_000, '2026-10-12'),
        moved('trip-savings', 5_000, '2026-11-01'),
      ],
    }).periodSummary
    expect(summary?.reserveAddedCents).toBe(20_000)
    expect(summary?.goals).toEqual([{ goalId: 'trip', startPercent: 15, endPercent: 45 }])
  })

  it('has no streak when the period closed negative', () => {
    const summary = computeMetrics(
      afterOctober([moved('groceries', 2_000_000, '2026-10-20')]),
    ).periodSummary
    expect(summary).toMatchObject({ positiveStreak: 0, streakCapped: false })
    expect(summary?.leftCents).toBeLessThan(0)
  })
})

describe('spendingAverage', () => {
  it('averages the last three periods that had any activity', () => {
    expect(computeMetrics(household()).spendingAverage).toEqual({
      monthlyCents: 35_000,
      periods: 2,
    })
  })

  it('has nothing to average before any history', () => {
    expect(computeMetrics(household({ recentPeriods: [] })).spendingAverage).toBeNull()
  })
})

describe('variableAverage', () => {
  it('averages the commission over the recent periods the household already used', () => {
    expect(computeMetrics(household()).variableAverage).toBe(50_000)
  })

  it('has nothing to average before any history', () => {
    expect(computeMetrics(household({ recentPeriods: [] })).variableAverage).toBeNull()
  })
})

describe('reserveCoverage', () => {
  it('says how many months of recent spending the reserve covers', () => {
    expect(computeMetrics(household()).reserveCoverage).toEqual({
      savedCents: 1_200_000,
      targetCents: 3_000_000,
      percent: 40,
      monthlySpendingCents: 35_000,
      months: 34.3,
    })
  })

  it('averages the last three periods, leaving out the ones with no activity', () => {
    const busy = household()
    const olderSpending = household({
      postings: [...busy.postings, moved('groceries', 900_000, '2026-04-10')],
    })
    expect(computeMetrics(olderSpending).reserveCoverage?.monthlySpendingCents).toBe(35_000)
    const recentSpending = household({
      postings: [...busy.postings, moved('groceries', 900_000, '2026-07-10')],
    })
    expect(computeMetrics(recentSpending).reserveCoverage?.monthlySpendingCents).toBe(
      Math.round((900_000 + 40_000 + 30_000) / 3),
    )
  })

  it('has no months without spending history, and nothing without a reserve', () => {
    expect(computeMetrics(household({ recentPeriods: [] })).reserveCoverage?.months).toBeNull()
    expect(computeMetrics(household({ goals: [] })).reserveCoverage).toBeNull()
  })
})

describe('committedAhead', () => {
  it('shows how much of each coming period installments and bills already take', () => {
    expect(computeMetrics(household()).committedAhead).toEqual([
      {
        label: '2026-11',
        installmentsCents: 30_000,
        plannedCents: 200_000,
        committedCents: 230_000,
        fixedIncomeCents: 400_000,
        percentOfIncome: 58,
      },
      {
        label: '2026-12',
        installmentsCents: 0,
        plannedCents: 0,
        committedCents: 0,
        fixedIncomeCents: 0,
        percentOfIncome: null,
      },
    ])
  })

  it('keeps counting installments by their month even when the budget counts purchases', () => {
    const byPurchase = computeMetrics(household({ installmentBudgetView: 'purchase_month' }))
    expect(byPurchase.committedAhead[0]?.installmentsCents).toBe(30_000)
  })
})

describe('nextInvoice', () => {
  it('forecasts the open invoice: what is on it plus the subscriptions before it closes, and the part of other people', () => {
    expect(computeMetrics(household()).nextInvoice).toEqual([
      {
        cardAccountId: 'card',
        closingOn: '2026-11-03',
        dueOn: '2026-11-10',
        postedCents: 45_000,
        plannedCents: 4_000,
        forecastCents: 49_000,
        frontedCents: 15_000,
      },
    ])
  })

  it('leaves out subscriptions of the next cycle, of other cards and skipped ones', () => {
    const base = household()
    const busier = household({
      occurrences: [
        ...base.occurrences,
        {
          id: 'extra-1',
          description: 'Bill',
          sourceAccountId: 'card',
          dueOn: '2026-11-05',
          amountCents: 7_000,
          entryType: 'card_purchase',
          status: 'pending',
          paidOn: null,
          categoryAccountId: 'electronics',
        },
        {
          id: 'extra-2',
          description: 'Bill',
          sourceAccountId: 'card',
          dueOn: '2026-10-27',
          amountCents: 6_000,
          entryType: 'card_purchase',
          status: 'skipped',
          paidOn: null,
          categoryAccountId: 'electronics',
        },
        {
          id: 'extra-3',
          description: 'Bill',
          sourceAccountId: 'other-card',
          dueOn: '2026-10-26',
          amountCents: 5_000,
          entryType: 'card_purchase',
          status: 'pending',
          paidOn: null,
          categoryAccountId: 'electronics',
        },
      ],
    })
    expect(computeMetrics(busier).nextInvoice[0]?.plannedCents).toBe(4_000)
  })

  it('starts empty for a card with nothing on its open invoice yet', () => {
    const forecast = computeMetrics(household({ invoices: [], occurrences: [] })).nextInvoice
    expect(forecast[0]).toMatchObject({
      postedCents: 0,
      plannedCents: 0,
      forecastCents: 0,
      frontedCents: 0,
    })
  })
})

describe('balanceForecast', () => {
  const checkingOf = (facts: PeriodFacts) =>
    computeMetrics(facts).balanceForecast.find((forecast) => forecast.accountId === 'checking')

  it('walks the balance day by day: an unpaid bill leaves today, the salary comes in', () => {
    expect(checkingOf(household())).toEqual({
      accountId: 'checking',
      until: '2026-10-31',
      startCents: 600_000,
      endCents: 800_000,
      lowestCents: 400_000,
      lowestOn: '2026-10-15',
      negativeFrom: null,
      negativeUntil: null,
      points: [
        { on: '2026-10-15', balanceCents: 400_000 },
        { on: '2026-10-20', balanceCents: 800_000 },
      ],
    })
  })

  it('reaches the next salary after the period, paying the card invoice on its due date', () => {
    const base = household()
    const lateSalary = household({
      today: '2026-10-25',
      occurrences: [
        ...base.occurrences.filter((occurrence) => occurrence.dueOn !== '2026-10-20'),
        {
          id: 'salary-november',
          description: 'Bill',
          sourceAccountId: 'checking',
          dueOn: '2026-11-12',
          amountCents: 400_000,
          entryType: 'income',
          status: 'pending',
          paidOn: null,
          categoryAccountId: 'salary-b',
        },
      ],
    })
    const forecast = checkingOf(lateSalary)
    expect(forecast?.until).toBe('2026-11-12')
    expect(forecast?.points).toEqual([
      { on: '2026-10-25', balanceCents: 400_000 },
      { on: '2026-11-10', balanceCents: 400_000 - 200_000 - 39_000 },
      { on: '2026-11-12', balanceCents: 400_000 - 200_000 - 39_000 + 400_000 },
    ])
  })

  it('pays the subscriptions of an open invoice that has no purchase on it yet', () => {
    const base = household()
    const onlySubscriptions = household({
      today: '2026-10-25',
      invoices: [],
      occurrences: [
        ...base.occurrences.filter((occurrence) => occurrence.dueOn !== '2026-10-20'),
        {
          id: 'salary-november',
          description: 'Bill',
          sourceAccountId: 'checking',
          dueOn: '2026-11-12',
          amountCents: 400_000,
          entryType: 'income',
          status: 'pending',
          paidOn: null,
          categoryAccountId: 'salary-b',
        },
      ],
    })
    expect(checkingOf(onlySubscriptions)?.points[1]).toEqual({
      on: '2026-11-10',
      balanceCents: 400_000 - 200_000 - 4_000,
    })
  })

  it('counts transfers on both sides and future-dated entries, never the commission', () => {
    const base = household()
    const withSavings = household({
      accounts: [
        ...base.accounts,
        { id: 'reserve', parentId: null, kind: 'savings', class: 'asset', incomeNature: null },
      ],
      postings: [...base.postings, moved('checking', -10_000, '2026-10-18')],
      occurrences: [
        ...base.occurrences,
        {
          id: 'save',
          description: 'Bill',
          sourceAccountId: 'checking',
          dueOn: '2026-10-22',
          amountCents: 50_000,
          entryType: 'transfer',
          status: 'pending',
          paidOn: null,
          categoryAccountId: 'reserve',
        },
      ],
      balances: [
        { accountId: 'checking', balanceCents: 590_000 },
        { accountId: 'reserve', balanceCents: 100_000 },
      ],
    })
    const forecasts = computeMetrics(withSavings).balanceForecast
    expect(forecasts.find((forecast) => forecast.accountId === 'reserve')?.endCents).toBe(150_000)
    expect(computeMetrics(withSavings).balanceForecastAll).toBeNull()
    expect(forecasts.find((forecast) => forecast.accountId === 'checking')).toMatchObject({
      startCents: 600_000,
      endCents: 600_000 - 200_000 - 10_000 + 400_000 - 50_000,
    })
  })

  it('finds the lowest point when the account goes below zero', () => {
    const tight = household({ balances: [{ accountId: 'checking', balanceCents: 100_000 }] })
    expect(checkingOf(tight)).toMatchObject({ lowestCents: -100_000, lowestOn: '2026-10-15' })
  })

  it('tells the stretch below zero, up to the day before the balance recovers', () => {
    const tight = household({ balances: [{ accountId: 'checking', balanceCents: 100_000 }] })
    expect(checkingOf(tight)).toMatchObject({
      negativeFrom: '2026-10-15',
      negativeUntil: '2026-10-19',
    })
  })

  it('keeps the stretch open to the horizon when the balance never recovers', () => {
    const broke = household({ balances: [{ accountId: 'checking', balanceCents: -900_000 }] })
    expect(checkingOf(broke)).toMatchObject({
      negativeFrom: '2026-10-15',
      negativeUntil: '2026-10-31',
    })
  })
})

describe('balanceForecastAll', () => {
  it('needs at least two everyday accounts to add up', () => {
    expect(computeMetrics(household()).balanceForecastAll).toBeNull()
  })

  it('adds the everyday accounts day by day, to the latest salary', () => {
    const base = household()
    const withWallet = household({
      accounts: [
        ...base.accounts,
        { id: 'wallet', parentId: null, kind: 'cash_wallet', class: 'asset', incomeNature: null },
      ],
      balances: [...base.balances, { accountId: 'wallet', balanceCents: 30_000 }],
    })
    const metrics = computeMetrics(withWallet)
    const checking = metrics.balanceForecast.find((forecast) => forecast.accountId === 'checking')

    expect(metrics.balanceForecastAll).toMatchObject({
      until: checking?.until,
      startCents: (checking?.startCents ?? 0) + 30_000,
      endCents: (checking?.endCents ?? 0) + 30_000,
      lowestCents: (checking?.lowestCents ?? 0) + 30_000,
      negativeFrom: null,
    })
    expect(metrics.balanceForecastAll?.points.map((point) => point.balanceCents)).toEqual(
      checking?.points.map((point) => point.balanceCents + 30_000),
    )
  })
})
