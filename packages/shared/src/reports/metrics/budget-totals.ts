import { budgetPace } from '@shared/reports/metrics/budget-pace'
import { sumCents } from '@shared/reports/metrics/facts'
import type { BudgetTotals, PeriodFacts } from '@shared/reports/metrics/metrics.types'

const PERCENT = 100

export function budgetTotals(facts: PeriodFacts): BudgetTotals {
  const lines = budgetPace(facts)
  const limitCents = sumCents(lines.map((line) => line.limitCents))
  const spentCents = sumCents(lines.map((line) => line.spentCents))
  return {
    count: lines.length,
    limitCents,
    spentCents,
    expectedCents: sumCents(lines.map((line) => line.expectedCents)),
    usedPercent: limitCents > 0 ? Math.round((spentCents * PERCENT) / limitCents) : 0,
    offPaceCount: lines.filter((line) => line.status !== 'within').length,
  }
}
