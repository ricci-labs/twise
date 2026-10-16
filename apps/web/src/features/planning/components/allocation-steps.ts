import type { AllocationStepInput } from '@financas/shared'
import type { AllocationStepItem } from '@web/features/planning/planning.types'

const INPUT_OF: Record<
  AllocationStepItem['kind'],
  (step: AllocationStepItem) => AllocationStepInput | null
> = {
  fill_goal: ({ goalId }) => (goalId ? { kind: 'fill_goal', goalId } : null),
  cover_overspent: () => ({ kind: 'cover_overspent' }),
  percent: ({ accountId, percent }) =>
    accountId && percent ? { kind: 'percent', accountId, percent } : null,
  fixed_amount: ({ accountId, amountCents }) =>
    accountId && amountCents ? { kind: 'fixed_amount', accountId, amountCents } : null,
  rest: ({ accountId }) => (accountId ? { kind: 'rest', accountId } : null),
}

export function stepInputOf(step: AllocationStepItem): AllocationStepInput | null {
  return INPUT_OF[step.kind](step)
}

export function stepsWithoutGoal(
  steps: readonly AllocationStepItem[],
  goalId: string,
): AllocationStepInput[] | undefined {
  if (!steps.some((step) => step.goalId === goalId)) {
    return undefined
  }
  return steps
    .filter((step) => step.goalId !== goalId)
    .map(stepInputOf)
    .filter((step): step is AllocationStepInput => step !== null)
}
