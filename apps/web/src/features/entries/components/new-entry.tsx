import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import {
  entryQueryOptions,
  plannedOccurrenceQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { EntryForm } from '@web/features/entries/components/entry-form'
import { formInputOf } from '@web/features/entries/components/entry-form-values'
import { EntryMatchQuestion } from '@web/features/entries/components/entry-match-question'
import type {
  EntryPrefill,
  NewEntryProps,
  PlannedEntryProps,
  PlannedOccurrence,
  RepeatedEntryProps,
  SavedEntry,
} from '@web/features/entries/entries.types'
import { formatTypedAmount } from '@web/lib/format/money'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const TIME_ZONE = 'America/Sao_Paulo'
const TRANSFER = 'transfer'
const CARD_PURCHASE = 'card_purchase'

export function NewEntry(props: NewEntryProps) {
  if (!props.isOpen || !hasPermission(props.permissions, 'entries', 'create')) {
    return null
  }
  return <NewEntryFlow {...props} />
}

function NewEntryFlow(props: NewEntryProps) {
  const [saved, setSaved] = useState<SavedEntry | null>(null)
  const occurrence = useQuery({
    ...plannedOccurrenceQueryOptions(props.workspaceId, props.occurrenceId ?? ''),
    enabled: props.occurrenceId !== undefined,
  })
  if (saved) {
    return (
      <EntryMatchQuestion
        workspaceId={props.workspaceId}
        saved={saved}
        occurrence={occurrence.data}
        onDone={props.onClose}
      />
    )
  }
  const splitPart = props.prefill?.splitPart
  const canMatch = hasPermission(props.permissions, 'planning', 'update')
  const flow = {
    ...props,
    onSaved: (entry: SavedEntry) => {
      if (splitPart) {
        props.onSplitPartSaved?.(splitPart.position)
      }
      if (canMatch) {
        setSaved(entry)
        return
      }
      props.onClose()
    },
  }
  if (props.repeatEntryId) {
    return <RepeatedEntry {...flow} repeatEntryId={props.repeatEntryId} />
  }
  if (props.occurrenceId) {
    return <PlannedEntry {...flow} occurrenceId={props.occurrenceId} />
  }
  return <NewEntryForm {...flow} />
}

function RepeatedEntry(props: RepeatedEntryProps) {
  const entry = useQuery(entryQueryOptions(props.workspaceId, props.repeatEntryId))
  if (!entry.data) {
    return null
  }
  const today = todayIn(TIME_ZONE, new Date())
  return (
    <NewEntryForm
      {...props}
      prefill={{ values: { ...formInputOf(entry.data), occurredOn: today } }}
    />
  )
}

function PlannedEntry(props: PlannedEntryProps) {
  const occurrence = useQuery(plannedOccurrenceQueryOptions(props.workspaceId, props.occurrenceId))
  if (!occurrence.data) {
    return null
  }
  return <NewEntryForm {...props} prefill={prefillOf(occurrence.data)} />
}

function NewEntryForm({
  workspaceId,
  currentUserId,
  currentUserName,
  permissions,
  prefill,
  onClose,
  onSaved,
}: NewEntryProps) {
  return (
    <EntryForm
      workspaceId={workspaceId}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      canSeeMembers={hasPermission(permissions, 'members', 'view')}
      canSeeContacts={hasPermission(permissions, 'contacts', 'view')}
      canCreateAccounts={hasPermission(permissions, 'accounts', 'create')}
      canCreateCards={hasPermission(permissions, 'cards', 'create')}
      today={todayIn(TIME_ZONE, new Date())}
      prefill={prefill}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}

function prefillOf(occurrence: PlannedOccurrence): EntryPrefill {
  const isCard = occurrence.entryType === CARD_PURCHASE
  const isTransfer = occurrence.entryType === TRANSFER
  return {
    entryType: occurrence.entryType,
    accountId: isCard ? undefined : occurrence.sourceAccountId,
    cardAccountId: isCard ? occurrence.sourceAccountId : undefined,
    planned: {
      amount: formatTypedAmount(occurrence.amountCents),
      description: occurrence.description,
      ...(isTransfer
        ? { toAccountId: occurrence.categoryAccountId }
        : { categoryId: occurrence.categoryAccountId }),
    },
  }
}
