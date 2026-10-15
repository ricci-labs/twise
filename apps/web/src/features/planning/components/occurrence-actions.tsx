import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { showToast } from '@web/components/feedback/toast'
import { useOccurrenceAction } from '@web/features/planning/api/use-occurrence-action'
import { OccurrenceAmountSheet } from '@web/features/planning/components/occurrence-amount-sheet'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  ListedOccurrence,
  OccurrenceActionRequest,
  OccurrenceActionsProps,
} from '@web/features/planning/planning.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatShortDate } from '@web/lib/format/calendar'
import { useState } from 'react'

const messages = planningMessages.occurrences
const copy = messages.actions
const ESTIMATE = '≈ '

export function OccurrenceActions({
  workspaceId,
  occurrence,
  accountName,
  className,
  children,
}: OccurrenceActionsProps) {
  const action = useOccurrenceAction(workspaceId)
  const [isChangingAmount, setIsChangingAmount] = useState(false)
  const when = formatShortDate(occurrence.dueOn)

  async function run(request: OccurrenceActionRequest, done?: () => void) {
    try {
      await action.mutateAsync(request)
      done?.()
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  function skip() {
    void run({ action: 'skip', occurrenceId: occurrence.id }, () =>
      showToast(messages.skippedToast(occurrence.description, when), {
        tone: 'success',
        action: { label: messages.undo, onPress: () => void unskip() },
      }),
    )
  }

  function unskip() {
    return run({ action: 'unskip', occurrenceId: occurrence.id })
  }

  function unmatch() {
    const entryId = occurrence.matchedEntryId
    void run({ action: 'unmatch', occurrenceId: occurrence.id }, () =>
      showToast(messages.unmatchedToast(occurrence.description, when), {
        tone: 'success',
        action: entryId
          ? {
              label: messages.undo,
              onPress: () => void run({ action: 'match', occurrenceId: occurrence.id, entryId }),
            }
          : undefined,
      }),
    )
  }

  const actions = actionsOf(occurrence, workspaceId, {
    changeAmount: () => setIsChangingAmount(true),
    skip,
    unskip: () => void unskip(),
    unmatch,
  })
  return (
    <>
      <ItemActions
        title={occurrence.description}
        description={descriptionOf(occurrence, accountName)}
        triggerLabel={copy.trigger(occurrence.description)}
        actions={actions}
        align="start"
        trigger={
          <button type="button" className={className}>
            {children}
          </button>
        }
      />
      <OccurrenceAmountSheet
        workspaceId={workspaceId}
        occurrence={occurrence}
        isOpen={isChangingAmount}
        onOpenChange={setIsChangingAmount}
      />
    </>
  )
}

function actionsOf(
  occurrence: ListedOccurrence,
  workspaceId: string,
  handlers: { changeAmount: () => void; skip: () => void; unskip: () => void; unmatch: () => void },
): ItemAction[] {
  if (occurrence.status === 'skipped') {
    return [{ key: 'unskip', label: copy.unskip, icon: 'refresh', onSelect: handlers.unskip }]
  }
  if (occurrence.status === 'matched') {
    return [
      ...(occurrence.matchedEntryId
        ? [
            {
              key: 'entry',
              label: copy.seeEntry,
              icon: 'list',
              render: (
                <Link
                  to="/w/$workspaceId/entries/$entry"
                  params={{ workspaceId, entry: occurrence.matchedEntryId }}
                />
              ),
            } as const,
          ]
        : []),
      { key: 'unmatch', label: copy.unmatch, icon: 'restore', onSelect: handlers.unmatch },
    ]
  }
  return [
    { key: 'amount', label: copy.amount, icon: 'edit', onSelect: handlers.changeAmount },
    { key: 'skip', label: copy.skip, icon: 'calendar', onSelect: handlers.skip },
  ]
}

function descriptionOf(occurrence: ListedOccurrence, accountName: string): string {
  if (occurrence.status === 'matched' && occurrence.paidOn) {
    const paidOn = formatShortDate(occurrence.paidOn)
    if (occurrence.entryType === 'income') {
      return copy.receivedIn(paidOn, accountName)
    }
    return occurrence.entryType === 'transfer'
      ? copy.doneOn(paidOn)
      : copy.paidWith(paidOn, accountName)
  }
  const estimate = occurrence.amountIsEstimate ? ESTIMATE : ''
  return copy.plannedFor(
    formatShortDate(occurrence.dueOn),
    `${estimate}${formatBrl(occurrence.amountCents)}`,
    accountName,
  )
}
