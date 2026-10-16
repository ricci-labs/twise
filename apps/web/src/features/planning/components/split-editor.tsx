import type { AllocationStepInput } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { showToast } from '@web/components/feedback/toast'
import { AllocationStepRow } from '@web/components/finance/allocation-step-row'
import { SplitExample, type SplitExampleChoice } from '@web/components/finance/split-example'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { useSaveSplit } from '@web/features/planning/api/use-save-split'
import { stepInputOf } from '@web/features/planning/components/allocation-steps'
import {
  draftOf,
  exampleOf,
  isInvalidStep,
  lastMovableOf,
  sameSteps,
  stepViewOf,
  suggestedSteps,
} from '@web/features/planning/components/split-views'
import { StepActions } from '@web/features/planning/components/step-actions'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  DraftStep,
  EmptySplitProps,
  SplitContext,
  SplitEditorProps,
  StepListProps,
} from '@web/features/planning/planning.types'
import { moved, useDragReorder } from '@web/hooks/use-drag-reorder'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { useState } from 'react'

const messages = planningMessages.split
const DEFAULT_EXAMPLE_CENTS = 100_000
const ALL_CHOICES: readonly SplitExampleChoice[] = ['current', 'average', 'custom']
const WITHOUT_AVERAGE: readonly SplitExampleChoice[] = ['current', 'custom']

export function SplitEditor({
  workspaceId,
  initial,
  goals,
  accounts,
  overview,
  canEdit,
}: SplitEditorProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const save = useSaveSplit(workspaceId)
  const [steps, setSteps] = useState<DraftStep[]>(() => draftOf(initial))
  const [choice, setChoice] = useState<SplitExampleChoice>('current')
  const [customAmount, setCustomAmount] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const reorder = useDragReorder({
    count: steps.length,
    lastMovable: lastMovableOf(steps),
    onMove: (from, to) => setSteps(moved(steps, from, to)),
  })
  const context: SplitContext = {
    goals: new Map(goals.map((goal) => [goal.id, goal])),
    accounts: new Map(accounts.map((account) => [account.id, account])),
    overspentCents: Math.max(-(overview?.metrics.freeToSpend ?? 0), 0),
  }
  const shown = reorder.drag ? moved(steps, reorder.drag.from, reorder.drag.to) : steps
  const average = overview?.metrics.variableAverage ?? null
  const amountCents = amountOf(choice, customAmount, overview?.metrics.variableIncome ?? 0, average)
  const example = exampleOf(shown, context, amountCents)
  const hasInvalid = steps.some((step) => isInvalidStep(step, context))
  const canSave = canEdit && !hasInvalid && !sameSteps(steps, initial)

  function remove(index: number) {
    const before = steps
    setSteps(steps.filter((_, position) => position !== index))
    showToast(messages.removed, {
      action: { label: messages.undo, onPress: () => setSteps(before) },
    })
  }

  async function confirmSave() {
    try {
      await save.mutateAsync(
        steps.map(stepInputOf).filter((step): step is AllocationStepInput => step !== null),
      )
      setIsConfirming(false)
      showToast(messages.saved, { tone: 'success' })
    } catch (error) {
      setIsConfirming(false)
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-6">
        {shown.length === 0 ? (
          <EmptySplit
            hasReserve={goals.some((goal) => goal.isReserve)}
            canEdit={canEdit}
            onSuggest={() => setSteps(suggestedSteps(goals, accounts))}
          />
        ) : (
          <StepList
            steps={steps}
            shown={shown}
            context={context}
            canEdit={canEdit}
            reorder={reorder}
            onChange={setSteps}
            onRemove={remove}
          />
        )}
        <SplitExample
          choice={choice}
          onChoiceChange={setChoice}
          choices={average === null ? WITHOUT_AVERAGE : ALL_CHOICES}
          customAmount={customAmount}
          onCustomAmountChange={setCustomAmount}
          amountCents={amountCents}
          parts={example.parts}
          leftoverCents={example.leftoverCents}
          hasBar={isDesktop}
        />
      </div>
      {canEdit && (
        <div className="sticky bottom-0 -mx-4 border-t border-border bg-page px-4 py-3 lg:static lg:mx-0 lg:flex lg:justify-end lg:border-0 lg:bg-transparent lg:p-0">
          <Button
            width="full"
            className="lg:w-auto"
            isDisabled={!canSave}
            onClick={() => setIsConfirming(true)}
          >
            {messages.save}
          </Button>
        </div>
      )}
      <ConfirmDialog
        title={messages.replace.title}
        description={messages.replace.text}
        cancelLabel={messages.replace.cancel}
        confirmLabel={messages.replace.confirm}
        isOpen={isConfirming}
        onOpenChange={setIsConfirming}
        onConfirm={() => void confirmSave()}
      />
    </>
  )
}

function amountOf(
  choice: SplitExampleChoice,
  customAmount: string,
  currentCents: number,
  averageCents: number | null,
): number {
  if (choice === 'custom') {
    return centsOfTypedAmount(customAmount) ?? 0
  }
  if (choice === 'average') {
    return averageCents ?? 0
  }
  return currentCents > 0 ? currentCents : (averageCents ?? DEFAULT_EXAMPLE_CENTS)
}

function EmptySplit({ hasReserve, canEdit, onSuggest }: EmptySplitProps) {
  return (
    <EmptyBlock
      icon="together"
      title={messages.empty}
      text={hasReserve ? messages.emptyText : messages.emptyTextNoReserve}
      action={
        canEdit && (
          <Button onClick={onSuggest}>
            <TwiseIcon name="plus" size="sm" />
            {messages.suggestion}
          </Button>
        )
      }
    />
  )
}

function StepList({ steps, shown, context, canEdit, reorder, onChange, onRemove }: StepListProps) {
  const lastMovable = lastMovableOf(steps)
  return (
    <ol aria-label={messages.stepsLabel} className="flex flex-col gap-2.5">
      {shown.map((step, index) => {
        const view = stepViewOf(step, context)
        const isRest = step.kind === 'rest'
        return (
          <AllocationStepRow
            key={step.key}
            ref={reorder.rowRef(index)}
            position={index + 1}
            title={view.title}
            detail={view.detail}
            art={view.art}
            isInvalid={view.isInvalid}
            isLifted={reorder.drag?.to === index}
            isReadOnly={!canEdit}
            gripProps={isRest ? undefined : reorder.gripOf(index)}
            actions={
              canEdit && !isRest ? (
                <StepActions
                  position={index + 1}
                  title={view.title}
                  canMoveUp={!isRest && index > 0}
                  canMoveDown={!isRest && index < lastMovable}
                  isRest={isRest}
                  onMove={(direction) => onChange(moved(steps, index, index + direction))}
                  onRemove={() => onRemove(index)}
                />
              ) : undefined
            }
          />
        )
      })}
    </ol>
  )
}
