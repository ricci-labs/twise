import { formatBrl } from '@financas/shared'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  BudgetAccounts,
  BudgetLine,
  BudgetLineView,
  BudgetSheetView,
  PlanningOverview,
  UnbudgetedView,
} from '@web/features/planning/planning.types'

const messages = planningMessages.budgets
const EXPENSE_CATEGORY = 'expense_category'

export function budgetLinesOf(
  overview: PlanningOverview,
  accounts: BudgetAccounts,
): BudgetLineView[] {
  return overview.metrics.budgetPace.map((line) => ({
    categoryAccountId: line.categoryAccountId,
    name: nameOf(line.categoryAccountId, accounts),
    art: artOf(line.categoryAccountId, accounts),
    spentCents: line.spentCents,
    limitCents: line.limitCents,
    status: line.status,
    statusText: statusTextOf(line),
    subcategories: line.children.map((child) => ({
      label: nameOf(child.categoryAccountId, accounts),
      amountCents: child.spentCents,
    })),
  }))
}

export function unbudgetedOf(
  overview: PlanningOverview,
  accounts: BudgetAccounts,
): UnbudgetedView[] {
  const budgeted = new Set(overview.metrics.budgetPace.map((line) => line.categoryAccountId))
  const spent = new Map(
    overview.metrics.unbudgetedSpending.map((line) => [line.categoryAccountId, line.spentCents]),
  )
  return [...accounts.values()]
    .filter(
      (account) =>
        account.kind === EXPENSE_CATEGORY &&
        account.parentId === null &&
        account.archivedAt === null &&
        !budgeted.has(account.id),
    )
    .map((account) => ({
      categoryAccountId: account.id,
      name: account.name,
      art: { name: account.name, icon: account.icon },
      spentCents: spent.get(account.id) ?? 0,
    }))
    .sort(
      (left, right) => right.spentCents - left.spentCents || left.name.localeCompare(right.name),
    )
}

export function budgetSheetOf(
  categoryAccountId: string,
  overview: PlanningOverview,
  accounts: BudgetAccounts,
): BudgetSheetView {
  const line = overview.metrics.budgetPace.find(
    (candidate) => candidate.categoryAccountId === categoryAccountId,
  )
  const name = nameOf(categoryAccountId, accounts)
  const childNames = [...accounts.values()]
    .filter((account) => account.parentId === categoryAccountId && account.archivedAt === null)
    .map((account) => account.name)
  const average = overview.metrics.categoryAverages.lines.find(
    (candidate) => candidate.categoryAccountId === categoryAccountId,
  )
  return {
    categoryAccountId,
    name,
    art: artOf(categoryAccountId, accounts),
    childNames,
    limitCents: line?.limitCents ?? null,
    spending: line ? spendingOf(line, name, accounts) : [],
    totalCents: line?.spentCents ?? 0,
    average: average
      ? { periods: overview.metrics.categoryAverages.periods, amountCents: average.averageCents }
      : null,
  }
}

function spendingOf(line: BudgetLine, name: string, accounts: BudgetAccounts) {
  if (line.children.length === 0) {
    return []
  }
  return [
    { label: messages.sheet.direct(name), amountCents: line.directCents },
    ...line.children.map((child) => ({
      label: nameOf(child.categoryAccountId, accounts),
      amountCents: child.spentCents,
    })),
  ]
}

function statusTextOf(line: BudgetLine): string {
  if (line.status === 'over') {
    return messages.status.over(formatBrl(line.overCents))
  }
  return line.status === 'ahead' ? messages.status.ahead(line.aheadPoints) : messages.status.within
}

function nameOf(accountId: string, accounts: BudgetAccounts): string {
  return accounts.get(accountId)?.name ?? ''
}

function artOf(accountId: string, accounts: BudgetAccounts): { name: string; icon: string | null } {
  const account = accounts.get(accountId)
  const parent = account?.parentId ? accounts.get(account.parentId) : undefined
  return { name: (parent ?? account)?.name ?? '', icon: account?.icon ?? parent?.icon ?? null }
}
