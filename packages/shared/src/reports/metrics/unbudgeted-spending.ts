import { largestFirst, spentUnder } from '@shared/reports/metrics/category-spending'
import { accountWithDescendants, postingsCounted } from '@shared/reports/metrics/facts'
import type { CategorySpending, PeriodFacts } from '@shared/reports/metrics/metrics.types'

export function unbudgetedSpending(facts: PeriodFacts): CategorySpending[] {
  const expenses = postingsCounted(facts, 'expense')
  const budgeted = new Set(facts.budgets.map((budget) => budget.categoryAccountId))
  const covered = new Set(
    [...budgeted].flatMap((categoryAccountId) => [
      ...accountWithDescendants(facts, categoryAccountId),
    ]),
  )
  return facts.accounts
    .filter(
      (account) =>
        account.kind === 'expense_category' &&
        account.parentId === null &&
        !budgeted.has(account.id),
    )
    .map((category) => ({
      categoryAccountId: category.id,
      spentCents: spentUnder(facts, category.id, expenses, covered),
    }))
    .filter((category) => category.spentCents > 0)
    .sort(largestFirst)
}
