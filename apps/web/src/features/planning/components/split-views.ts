import { type AllocationStep, formatBrl, splitVariableIncome } from '@financas/shared'
import type { SplitExamplePart } from '@web/components/finance/split-example'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  AllocationStepItem,
  DraftStep,
  PlanningAccount,
  PlanningGoal,
  SplitContext,
  SplitExampleFigures,
  StepView,
} from '@web/features/planning/planning.types'

const messages = planningMessages.split
const COVER_ART = 'calendar'
const RESERVE_ART = 'piggy-bank'
const CHECKING = 'checking'
let lastKey = 0

export function draftOf(steps: readonly AllocationStepItem[]): DraftStep[] {
  return steps.map((step) => ({ ...step, key: nextKey() }))
}

export function nextKey(): string {
  lastKey += 1
  return `step-${lastKey}`
}

export function isInvalidStep(step: AllocationStepItem, context: SplitContext): boolean {
  return step.kind === 'fill_goal' && !context.goals.has(step.goalId ?? '')
}

export function stepViewOf(step: AllocationStepItem, context: SplitContext): StepView {
  const account = context.accounts.get(step.accountId ?? '')
  const accountName = account?.name ?? ''
  const art = { name: accountName, icon: account?.icon ?? null }
  switch (step.kind) {
    case 'fill_goal':
      return goalStepView(step, context)
    case 'cover_overspent':
      return {
        title: messages.steps.cover,
        detail:
          context.overspentCents > 0
            ? messages.steps.coverDetail(formatBrl(context.overspentCents))
            : messages.steps.coverNothing,
        art: { name: messages.steps.cover, icon: COVER_ART },
        isInvalid: false,
        exampleLabel: messages.example.cover,
      }
    case 'percent':
      return {
        title: messages.steps.percent(step.percent ?? 0, accountName),
        detail: messages.steps.percentDetail + goalNoteOf(step.accountId, context),
        art,
        isInvalid: false,
        exampleLabel: messages.example.percent(accountName, step.percent ?? 0),
      }
    case 'fixed_amount':
      return {
        title: messages.steps.fixed(formatBrl(step.amountCents ?? 0), accountName),
        detail: messages.steps.fixedDetail + goalNoteOf(step.accountId, context),
        art,
        isInvalid: false,
        exampleLabel: messages.example.fixed(accountName),
      }
    case 'rest':
      return {
        title: messages.steps.rest(accountName),
        detail: messages.steps.restDetail,
        art,
        isInvalid: false,
        exampleLabel: messages.example.rest(accountName),
      }
  }
}

function goalStepView(step: AllocationStepItem, context: SplitContext): StepView {
  const goal = context.goals.get(step.goalId ?? '')
  if (!goal) {
    return {
      title: messages.steps.deletedGoal,
      detail: undefined,
      art: { name: messages.steps.deletedGoal, icon: null },
      isInvalid: true,
      exampleLabel: messages.steps.deletedGoal,
    }
  }
  const account = context.accounts.get(goal.accountId)
  const accountName = account?.name ?? ''
  return {
    title: goal.isReserve ? messages.steps.fillReserve : messages.steps.fillGoal(goal.name),
    detail: messages.steps.fillGoalDetail(formatBrl(goal.remainingCents), accountName),
    art: { name: accountName, icon: account?.icon ?? (goal.isReserve ? RESERVE_ART : null) },
    isInvalid: false,
    exampleLabel: goal.isReserve
      ? messages.example.reserve(accountName)
      : messages.example.goal(goal.name),
  }
}

function goalNoteOf(accountId: string | null, context: SplitContext): string {
  const goal = [...context.goals.values()].find((candidate) => candidate.accountId === accountId)
  if (!goal) {
    return ''
  }
  return goal.isReserve ? messages.steps.ofReserve : messages.steps.ofGoal(goal.name)
}

export function exampleOf(
  steps: readonly DraftStep[],
  context: SplitContext,
  amountCents: number,
): SplitExampleFigures {
  const valid = steps.filter((step) => !isInvalidStep(step, context))
  const split = splitVariableIncome(amountCents, valid.map(allocationStepOf), {
    goals: [...context.goals.values()].map((goal) => ({
      goalId: goal.id,
      accountId: goal.accountId,
      targetCents: goal.targetCents,
      savedCents: goal.savedCents,
    })),
    overspentCents: context.overspentCents,
  })
  const parts: SplitExamplePart[] = steps.map((step, index) => {
    const validPosition = valid.indexOf(step) + 1
    const part = split.parts.find((candidate) => candidate.position === validPosition)
    return {
      position: index + 1,
      label: stepViewOf(step, context).exampleLabel,
      amountCents: validPosition === 0 ? null : (part?.amountCents ?? 0),
    }
  })
  return { parts, leftoverCents: split.leftoverCents }
}

function allocationStepOf({
  kind,
  goalId,
  accountId,
  percent,
  amountCents,
}: DraftStep): AllocationStep {
  return { kind, goalId, accountId, percent, amountCents }
}

export function suggestedSteps(
  goals: readonly PlanningGoal[],
  accounts: readonly PlanningAccount[],
): DraftStep[] {
  const reserve = goals.find((goal) => goal.isReserve)
  const everyday = accounts.find(
    (account) => account.kind === CHECKING && !account.isSystem && account.archivedAt === null,
  )
  const empty = { goalId: null, accountId: null, percent: null, amountCents: null }
  return [
    ...(reserve ? [{ ...empty, position: 1, kind: 'fill_goal' as const, goalId: reserve.id }] : []),
    ...(everyday ? [{ ...empty, position: 2, kind: 'rest' as const, accountId: everyday.id }] : []),
  ].map((step) => ({ ...step, key: nextKey() }))
}

export function lastMovableOf(steps: readonly DraftStep[]): number {
  const last = steps.length - 1
  return steps[last]?.kind === 'rest' ? last - 1 : last
}

export function sameSteps(
  left: readonly AllocationStepItem[],
  right: readonly AllocationStepItem[],
) {
  const shape = (steps: readonly AllocationStepItem[]) =>
    JSON.stringify(
      steps.map(({ kind, goalId, accountId, percent, amountCents }) => [
        kind,
        goalId,
        accountId,
        percent,
        amountCents,
      ]),
    )
  return shape(left) === shape(right)
}

export function shortcutTextOf(
  steps: readonly AllocationStepItem[],
  context: SplitContext,
): string {
  const [first] = steps
  if (!first) {
    return messages.shortcutEmpty
  }
  return messages.shortcut(steps.length, destinationOf(first, context))
}

function destinationOf(step: AllocationStepItem, context: SplitContext): string {
  if (step.kind === 'cover_overspent') {
    return messages.destination.cover
  }
  if (step.kind === 'fill_goal') {
    const goal = context.goals.get(step.goalId ?? '')
    return goal?.isReserve
      ? messages.destination.reserve
      : (goal?.name ?? messages.steps.deletedGoal)
  }
  return context.accounts.get(step.accountId ?? '')?.name ?? ''
}
