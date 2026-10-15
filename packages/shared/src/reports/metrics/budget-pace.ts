import { childrenSpending, spentUnder } from '@shared/reports/metrics/category-spending'
import { periodDays, postingsCounted, sumCents } from '@shared/reports/metrics/facts'
import type { BudgetPace, PeriodFacts } from '@shared/reports/metrics/metrics.types'

const PERCENT = 100

export function budgetPace(facts: PeriodFacts): BudgetPace[] {
  const expenses = postingsCounted(facts, 'expense')
  const { total, elapsed } = periodDays(facts)
  return facts.budgets.map(({ categoryAccountId, limitCents }) => {
    const spentCents = spentUnder(facts, categoryAccountId, expenses)
    const children = childrenSpending(facts, categoryAccountId, expenses)
    const expectedCents = Math.round((limitCents * elapsed) / total)
    return {
      categoryAccountId,
      limitCents,
      spentCents,
      expectedCents,
      overCents: Math.max(spentCents - limitCents, 0),
      aheadPoints: aheadPointsOf(spentCents, limitCents, elapsed / total),
      status: statusOf(spentCents, limitCents, elapsed > 0 ? expectedCents : limitCents),
      directCents: spentCents - sumCents(children.map((child) => child.spentCents)),
      children,
    }
  })
}

function aheadPointsOf(spentCents: number, limitCents: number, elapsedShare: number): number {
  if (limitCents <= 0) {
    return 0
  }
  const usedPercent = Math.round((spentCents / limitCents) * PERCENT)
  return Math.max(usedPercent - Math.round(elapsedShare * PERCENT), 0)
}

function statusOf(spentCents: number, limitCents: number, paceCents: number): BudgetPace['status'] {
  if (spentCents > limitCents) {
    return 'over'
  }
  return spentCents > paceCents ? 'ahead' : 'within'
}
