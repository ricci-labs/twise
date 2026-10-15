import { accountWithDescendants, postingsCounted, sumCents } from '@shared/reports/metrics/facts'
import type { CategorySpending, PeriodFacts } from '@shared/reports/metrics/metrics.types'

export function spentUnder(
  facts: PeriodFacts,
  categoryAccountId: string,
  counted = postingsCounted(facts, 'expense'),
  leftOut: ReadonlySet<string> = new Set(),
): number {
  const covered = accountWithDescendants(facts, categoryAccountId)
  return sumCents(
    counted
      .filter((posting) => covered.has(posting.accountId) && !leftOut.has(posting.accountId))
      .map((posting) => posting.amountCents),
  )
}

export function childrenSpending(
  facts: PeriodFacts,
  parentAccountId: string,
  counted = postingsCounted(facts, 'expense'),
): CategorySpending[] {
  return facts.accounts
    .filter((account) => account.parentId === parentAccountId)
    .map((child) => ({
      categoryAccountId: child.id,
      spentCents: spentUnder(facts, child.id, counted),
    }))
    .filter((child) => child.spentCents > 0)
    .sort(largestFirst)
}

export function largestFirst(left: CategorySpending, right: CategorySpending): number {
  return right.spentCents - left.spentCents
}
