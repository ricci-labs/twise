import { type AllocationStepInput, MAX_ALLOCATION_STEPS } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { showToast } from '@web/components/feedback/toast'
import { AllocationStepRow } from '@web/components/finance/allocation-step-row'
import { SplitExample, type SplitExampleChoice } from '@web/components/finance/split-example'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { useSaveSplit } from '@web/features/planning/api/use-save-split'
import { stepInputOf } from '@web/features/planning/components/allocation-steps'
import { SplitHeader } from '@web/features/planning/components/split-header'
import {
  draftOf,
  exampleOf,
  isInvalidStep,
  lastMovableOf,
  nextKey,
  sameSteps,
  stepViewOf,
  suggestedSteps,
} from '@web/features/planning/components/split-views'
import { StepActions } from '@web/features/planning/components/step-actions'
import { StepSheet } from '@web/features/planning/components/step-sheet'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  AddStepButtonProps,
  DraftStep,
  EmptySplitProps,
  SaveBarProps,
  SplitContext,
  SplitEditorProps,
  StepListProps,
  StepShape,
  StepSheetState,
  StepsCardProps,
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
const RULES = [
  { key: 'order', icon: 'collapse' },
  { key: 'percent', icon: 'info' },
  { key: 'rest', icon: 'expand' },
] as const
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
  const [steps, setSteps] = useState<DraftStep[]>(() => draftOf(initial))
  const [sheet, setSheet] = useState<StepSheetState | null>(null)
  const reorder = useDragReorder({
    count: steps.length,
    lastMovable: lastMovableOf(steps),
    onMove: (from, to) => setSteps(moved(steps, from, to)),
  })
  const context = contextOf(goals, accounts, overview)
  const shown = reorder.drag ? moved(steps, reorder.drag.from, reorder.drag.to) : steps
  const example = useSplitExample(shown, context, overview)
  const hasInvalid = steps.some((step) => isInvalidStep(step, context))
  const canSave = canEdit && !hasInvalid && !sameSteps(steps, initial)

  function remove(index: number) {
    const before = steps
    setSteps(steps.filter((_, position) => position !== index))
    showToast(messages.removed, {
      action: { label: messages.undo, onPress: () => setSteps(before) },
    })
  }

  function saveStep(step: StepShape) {
    setSteps(withSavedStep(steps, step, sheet?.index))
  }

  const editing = editingOf(sheet, steps)
  const saving = useConfirmedSave(workspaceId, steps)
  const canAdd = canEdit && steps.length < MAX_ALLOCATION_STEPS

  const saveButton = canEdit && (
    <Button
      width="full"
      className="lg:w-auto"
      isDisabled={!canSave}
      onClick={() => saving.setIsConfirming(true)}
    >
      {messages.save}
    </Button>
  )

  return (
    <>
      <SplitHeader workspaceId={workspaceId} actions={isDesktop ? saveButton : undefined} />
      <div className="grid gap-4 lg:grid-cols-5 lg:items-start lg:gap-5">
        <StepsCard isDesktop={isDesktop}>
          {shown.length === 0 ? (
            <EmptySplit
              hasReserve={goals.some((goal) => goal.isReserve)}
              canEdit={canEdit}
              onSuggest={() => setSteps(suggestedSteps(goals, accounts))}
              onAdd={() => setSheet({})}
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              <StepList
                steps={steps}
                shown={shown}
                context={context}
                canEdit={canEdit}
                reorder={reorder}
                onChange={setSteps}
                onRemove={remove}
                onEdit={(index) => setSheet({ index })}
              />
              {canAdd && <AddStepButton onPress={() => setSheet({})} />}
            </div>
          )}
        </StepsCard>
        <SplitExample {...example} hasBar={isDesktop} className="lg:col-span-2" />
      </div>
      {isDesktop || <SaveBar>{saveButton}</SaveBar>}
      {sheet && (
        <StepSheet
          isOpen
          onOpenChange={(isOpen) => !isOpen && setSheet(null)}
          editing={editing}
          restAccountName={restNameOf(steps, editing, context)}
          goals={goals}
          accounts={accounts}
          exampleCents={example.amountCents}
          onSave={saveStep}
        />
      )}
      <ConfirmDialog
        title={messages.replace.title}
        description={messages.replace.text}
        cancelLabel={messages.replace.cancel}
        confirmLabel={messages.replace.confirm}
        isOpen={saving.isConfirming}
        onOpenChange={saving.setIsConfirming}
        onConfirm={() => void saving.confirm()}
      />
    </>
  )
}

function useSplitExample(
  steps: readonly DraftStep[],
  context: SplitContext,
  overview: SplitEditorProps['overview'],
) {
  const [choice, setChoice] = useState<SplitExampleChoice>('current')
  const [customAmount, setCustomAmount] = useState('')
  const average = overview?.metrics.variableAverage ?? null
  const amountCents = amountOf(choice, customAmount, overview?.metrics.variableIncome ?? 0, average)
  return {
    choice,
    onChoiceChange: setChoice,
    choices: average === null ? WITHOUT_AVERAGE : ALL_CHOICES,
    customAmount,
    onCustomAmountChange: setCustomAmount,
    amountCents,
    ...exampleOf(steps, context, amountCents),
  }
}

function contextOf(
  goals: SplitEditorProps['goals'],
  accounts: SplitEditorProps['accounts'],
  overview: SplitEditorProps['overview'],
): SplitContext {
  return {
    goals: new Map(goals.map((goal) => [goal.id, goal])),
    accounts: new Map(accounts.map((account) => [account.id, account])),
    overspentCents: Math.max(-(overview?.metrics.freeToSpend ?? 0), 0),
  }
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

function EmptySplit({ hasReserve, canEdit, onSuggest, onAdd }: EmptySplitProps) {
  return (
    <EmptyBlock
      icon="together"
      title={messages.empty}
      text={hasReserve ? messages.emptyText : messages.emptyTextNoReserve}
      action={
        canEdit && (
          <div className="grid justify-center gap-3">
            <Button onClick={onSuggest}>
              <TwiseIcon name="plus" size="sm" />
              {messages.suggestion}
            </Button>
            <Button variant="secondary" onClick={onAdd}>
              <TwiseIcon name="plus" size="sm" />
              {messages.add}
            </Button>
          </div>
        )
      }
    />
  )
}

function StepList({
  steps,
  shown,
  context,
  canEdit,
  reorder,
  onChange,
  onRemove,
  onEdit,
}: StepListProps) {
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
              canEdit ? (
                <StepActions
                  position={index + 1}
                  title={view.title}
                  canMoveUp={!isRest && index > 0}
                  canMoveDown={!isRest && index < lastMovable}
                  isRest={isRest}
                  onMove={(direction) => onChange(moved(steps, index, index + direction))}
                  onEdit={step.kind === 'cover_overspent' ? undefined : () => onEdit(index)}
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

function restNameOf(
  steps: readonly DraftStep[],
  editing: DraftStep | null,
  context: SplitContext,
): string | null {
  const rest = steps.find((step) => step.kind === 'rest')
  if (!rest || rest === editing) {
    return null
  }
  return context.accounts.get(rest.accountId ?? '')?.name ?? ''
}

function withSavedStep(
  steps: readonly DraftStep[],
  step: StepShape,
  index: number | undefined,
): DraftStep[] {
  if (index !== undefined) {
    return steps.map((current, position) =>
      position === index ? { ...current, ...step } : current,
    )
  }
  return withNewStep(steps, step)
}

function withNewStep(steps: readonly DraftStep[], step: StepShape): DraftStep[] {
  const added = { ...step, position: 0, key: nextKey() }
  const restIndex = steps.findIndex((current) => current.kind === 'rest')
  if (step.kind === 'rest' || restIndex === -1) {
    return [...steps, added]
  }
  return [...steps.slice(0, restIndex), added, ...steps.slice(restIndex)]
}

function StepsCard({ isDesktop, children }: StepsCardProps) {
  if (!isDesktop) {
    return <div className="flex flex-col gap-2.5">{children}</div>
  }
  return (
    <section
      aria-labelledby="split-steps-title"
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-6 pt-5 pb-4 lg:col-span-3"
    >
      <div>
        <h2 id="split-steps-title" className="font-display text-section-title">
          {messages.stepsTitle}
        </h2>
        <p className="text-note text-ink-muted">{messages.stepsHint}</p>
      </div>
      {children}
      <ul className="mt-2 flex flex-col gap-2 border-t border-border pt-3 text-note text-ink-muted">
        {RULES.map(({ key, icon }) => (
          <li key={key} className="flex items-start gap-2">
            <TwiseIcon name={icon} size="sm" />
            {messages.rules[key]}
          </li>
        ))}
      </ul>
    </section>
  )
}

function AddStepButton({ onPress }: AddStepButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border-control text-label font-semibold text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      <TwiseIcon name="plus" size="sm" />
      {messages.add}
    </button>
  )
}

function SaveBar({ children }: SaveBarProps) {
  if (!children) {
    return null
  }
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-border bg-page px-4 py-3">{children}</div>
  )
}

function useConfirmedSave(workspaceId: string, steps: readonly DraftStep[]) {
  const save = useSaveSplit(workspaceId)
  const [isConfirming, setIsConfirming] = useState(false)

  async function confirm() {
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

  return { isConfirming, setIsConfirming, confirm }
}

function editingOf(sheet: StepSheetState | null, steps: readonly DraftStep[]): DraftStep | null {
  if (sheet?.index === undefined) {
    return null
  }
  return steps[sheet.index] ?? null
}
