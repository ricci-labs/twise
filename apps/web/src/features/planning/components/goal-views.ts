import type { GoalCardProps } from '@web/components/finance/goal-card'
import type { ReserveFigures } from '@web/components/finance/reserve-card'
import type { PlanningAccount, PlanningGoal } from '@web/features/planning/planning.types'
import { formatMonthLabel } from '@web/lib/format/calendar'

const MONTH_LABEL_LENGTH = 7

export function accountNameOf(
  goal: PlanningGoal,
  accounts: ReadonlyMap<string, PlanningAccount>,
): string {
  return accounts.get(goal.accountId)?.name ?? ''
}

export function reserveFiguresOf(
  reserve: PlanningGoal,
  accounts: ReadonlyMap<string, PlanningAccount>,
  coverageMonths: number | null,
): ReserveFigures {
  return {
    savedCents: reserve.savedCents,
    targetCents: reserve.targetCents,
    accountName: accountNameOf(reserve, accounts),
    percent: reserve.percent,
    remainingCents: reserve.remainingCents,
    overCents: reserve.overCents,
    coverageMonths,
  }
}

export function goalCardOf(
  goal: PlanningGoal,
  accounts: ReadonlyMap<string, PlanningAccount>,
): Omit<GoalCardProps, 'actions'> {
  const account = accounts.get(goal.accountId)
  return {
    name: goal.name,
    art: { name: account?.name ?? goal.name, icon: account?.icon ?? null },
    accountName: account?.name ?? '',
    savedCents: goal.savedCents,
    targetCents: goal.targetCents,
    percent: goal.percent,
    remainingCents: goal.remainingCents,
    overCents: goal.overCents,
    deadlineLabel: goal.targetOn
      ? formatMonthLabel(goal.targetOn.slice(0, MONTH_LABEL_LENGTH))
      : null,
    monthlyToTargetCents: goal.monthlyToTargetCents,
  }
}
