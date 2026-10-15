import { spentUnder } from '@shared/reports/metrics/category-spending'
import { postingsCounted, recentActivePeriods } from '@shared/reports/metrics/facts'
import type { CategoryAverages, PeriodFacts } from '@shared/reports/metrics/metrics.types'

const PERIODS_OF_SPENDING = 3

export function categoryAverages(facts: PeriodFacts): CategoryAverages {
  const periods = recentActivePeriods(facts, PERIODS_OF_SPENDING)
  if (periods.length === 0) {
    return { periods: 0, lines: [] }
  }
  const expensesByPeriod = periods.map((period) => postingsCounted(facts, 'expense', period))
  const lines = facts.accounts
    .filter((account) => account.kind === 'expense_category')
    .map((category) => {
      const total = expensesByPeriod.reduce(
        (sum, expenses) => sum + spentUnder(facts, category.id, expenses),
        0,
      )
      return { categoryAccountId: category.id, averageCents: Math.round(total / periods.length) }
    })
    .filter((line) => line.averageCents > 0)
  return { periods: periods.length, lines }
}
