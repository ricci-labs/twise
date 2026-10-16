import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { showToast } from '@web/components/feedback/toast'
import { useOccurrenceAction } from '@web/features/planning/api/use-occurrence-action'
import { EntryPickerSheet } from '@web/features/planning/components/entry-picker-sheet'
import { OccurrenceAmountSheet } from '@web/features/planning/components/occurrence-amount-sheet'
import { planningMessages } from '@web/features/planning/planning.messages'
import type {
  ListedOccurrence,
  OccurrenceActionRequest,
  OccurrenceActionsProps,
  OccurrenceHandlers,
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
  accounts,
  canRecord,
  triggerLabel,
  className,
  children,
}: OccurrenceActionsProps) {
  const action = useOccurrenceAction(workspaceId)
  const [isChangingAmount, setIsChangingAmount] = useState(false)
  const [isPickingEntry, setIsPickingEntry] = useState(false)
  const accountName = accounts.get(occurrence.sourceAccountId)?.name ?? ''
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

  const actions = actionsOf(occurrence, workspaceId, canRecord, {
    changeAmount: () => setIsChangingAmount(true),
    pickEntry: () => setIsPickingEntry(true),
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
          <button type="button" aria-label={triggerLabel} className={className}>
            {children}
          </button>
        }
      />
      <EntryPickerSheet
        workspaceId={workspaceId}
        occurrence={occurrence}
        accounts={accounts}
        isOpen={isPickingEntry}
        onOpenChange={setIsPickingEntry}
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

export function recordLabelOf(occurrence: ListedOccurrence): string {
  const action = occurrence.entryType === 'income' ? copy.recordIncome : copy.recordPayment
  return copy.recordFor(action, occurrence.description)
}

function actionsOf(
  occurrence: ListedOccurrence,
  workspaceId: string,
  canRecord: boolean,
  handlers: OccurrenceHandlers,
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
    ...(canRecord
      ? [
          {
            key: 'record',
            label: occurrence.entryType === 'income' ? copy.recordIncome : copy.recordPayment,
            icon: 'plus',
            render: (
              <Link
                to="."
                search={(previous) => ({
                  ...previous,
                  entry: 'new',
                  entryOccurrence: occurrence.id,
                })}
              />
            ),
          } as const,
        ]
      : []),
    { key: 'picked', label: copy.alreadyRecorded, icon: 'ok', onSelect: handlers.pickEntry },
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
