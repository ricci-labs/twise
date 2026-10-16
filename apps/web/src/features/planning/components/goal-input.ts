import type { GoalChange, NewGoal } from '@financas/shared'
import type { GoalFormValues, PlanningGoal } from '@web/features/planning/planning.types'
import { centsOfTypedAmount, formatTypedAmount } from '@web/lib/format/money'

export function blankGoal(isReserve: boolean): GoalFormValues {
  return { name: '', target: '', accountId: '', targetOn: '', isReserve }
}

export function goalInputOf(goal: PlanningGoal): GoalFormValues {
  return {
    name: goal.name,
    target: formatTypedAmount(goal.targetCents),
    accountId: goal.accountId,
    targetOn: goal.targetOn ?? '',
    isReserve: goal.isReserve,
  }
}

export function newGoalOf(values: GoalFormValues): NewGoal {
  return {
    name: values.name.trim(),
    targetCents: centsOfTypedAmount(values.target) ?? 0,
    accountId: values.accountId,
    targetOn: values.targetOn || null,
    isReserve: values.isReserve,
  }
}

export function goalChangeOf(values: GoalFormValues): GoalChange {
  return newGoalOf(values)
}
