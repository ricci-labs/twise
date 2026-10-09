import { DEMO_IDS } from '@shared/reports/demo/demo.constants'
import { demoOverview } from '@shared/reports/demo/demo-household'
import { describe, expect, it } from 'vitest'

describe('demo household', () => {
  it('gives the numbers of the Home design for the current period', () => {
    const { today, period, metrics } = demoOverview('current')

    expect(today).toBe('2026-10-20')
    expect(period).toEqual({ label: '2026-10', start: '2026-10-05', end: '2026-11-04' })
    expect(metrics).toMatchObject({
      budgetIncome: 900_000,
      variableIncome: 150_000,
      spent: 386_000,
      committed: 280_000,
      freeToSpend: 234_000,
      dailyAllowance: 14_625,
      variableAverage: 120_000,
      reserveCoverage: { monthlySpendingCents: 630_000, months: 2.4 },
    })
  })

  it('has one budget over, one ahead of pace and three within', () => {
    const statuses = demoOverview('current').metrics.budgetPace.map(
      ({ categoryAccountId, status }) => [categoryAccountId, status],
    )

    expect(statuses).toEqual([
      [DEMO_IDS.leisure, 'over'],
      [DEMO_IDS.groceries, 'ahead'],
      [DEMO_IDS.transport, 'within'],
      [DEMO_IDS.home, 'within'],
      [DEMO_IDS.health, 'within'],
    ])
  })

  it('commits 72% of January and forecasts both invoices', () => {
    const { committedAhead, nextInvoice } = demoOverview('current').metrics

    expect(committedAhead.map((month) => month.percentOfIncome)).toEqual([52, 52, 72, 43, 43, 43])
    expect(nextInvoice).toMatchObject([
      { closingOn: '2026-10-25', dueOn: '2026-11-04', postedCents: 184_000, plannedCents: 11_000 },
      { closingOn: '2026-11-02', dueOn: '2026-11-10', postedCents: 62_000, plannedCents: 0 },
    ])
  })

  it('keeps the main account positive until the next salary', () => {
    const [mainAccount] = demoOverview('current').metrics.balanceForecast

    expect(mainAccount).toMatchObject({
      startCents: 420_000,
      lowestCents: 41_000,
      lowestOn: '2026-11-04',
      until: '2026-11-05',
    })
  })

  it('raises the insights the Home shows, alerts first', () => {
    const codes = demoOverview('current').insights.map((insight) => insight.code)

    expect(codes).toEqual([
      'budget_over',
      'occurrence_overdue',
      'budget_ahead',
      'period_heavily_committed',
      'contact_overdue',
      'variable_income_to_split',
    ])
  })

  it('passes the plan by R$ 380,00 when the car repair comes in', () => {
    const { metrics, insights } = demoOverview('overspent')

    expect(metrics).toMatchObject({ spent: 658_000, freeToSpend: -38_000 })
    expect(insights[0]).toMatchObject({
      code: 'period_overspent',
      values: { overspentCents: 38_000 },
    })
  })

  it('closes September with R$ 410,00 left and nothing pending', () => {
    const { period, metrics } = demoOverview('closed')

    expect(period.label).toBe('2026-09')
    expect(metrics).toMatchObject({
      spent: 859_000,
      committed: 0,
      freeToSpend: 41_000,
      dailyAllowance: null,
    })
  })

  it('shows November as a future period with its installments and bills', () => {
    const { period, metrics } = demoOverview('future')

    expect(period).toEqual({ label: '2026-11', start: '2026-11-05', end: '2026-12-04' })
    expect(metrics).toMatchObject({ spent: 84_000, committed: 385_000, variableIncome: 0 })
  })
})
