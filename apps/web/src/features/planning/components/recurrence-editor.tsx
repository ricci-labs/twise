import { addDays, formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import {
  accountsQueryOptions,
  occurrencesQueryOptions,
  periodsQueryOptions,
  recurrencesQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { RecurrenceForm } from '@web/features/planning/components/recurrence-form'
import {
  blankRecurrence,
  recurrenceInputOf,
} from '@web/features/planning/components/recurrence-input'
import { planningMessages } from '@web/features/planning/planning.messages'
import { NEW_RECURRENCE } from '@web/features/planning/planning.schemas'
import type {
  EditRecurrenceProps,
  ListedOccurrence,
  ListedRecurrence,
  NewRecurrenceProps,
  RecurrenceEditorProps,
} from '@web/features/planning/planning.types'
import { formatShortDate } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'

const FIRST_TYPE = 'expense'
const AHEAD_DAYS = 200

export function RecurrenceEditor({
  workspaceId,
  permissions,
  search,
  onClose,
}: RecurrenceEditorProps) {
  if (search.recurrence === undefined) {
    return null
  }
  if (search.recurrence !== NEW_RECURRENCE) {
    return hasPermission(permissions, 'planning', 'update') ? (
      <EditRecurrence workspaceId={workspaceId} ruleId={search.recurrence} onClose={onClose} />
    ) : null
  }
  if (!hasPermission(permissions, 'planning', 'create')) {
    return null
  }
  return (
    <NewRecurrence
      workspaceId={workspaceId}
      entryType={search.recurrenceType ?? FIRST_TYPE}
      onClose={onClose}
    />
  )
}

function NewRecurrence({ workspaceId, entryType, onClose }: NewRecurrenceProps) {
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data
  const today = useQuery(periodsQueryOptions(workspaceId, undefined)).data?.today
  if (!accounts || !today) {
    return null
  }
  return (
    <RecurrenceForm
      workspaceId={workspaceId}
      today={today}
      accounts={accounts}
      defaults={blankRecurrence(entryType, today)}
      onClose={onClose}
    />
  )
}

function EditRecurrence({ workspaceId, ruleId, onClose }: EditRecurrenceProps) {
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data
  const today = useQuery(periodsQueryOptions(workspaceId, undefined)).data?.today
  const rule = useQuery(recurrencesQueryOptions(workspaceId)).data?.items.find(
    (item) => item.id === ruleId,
  )
  const ahead = useQuery({
    ...occurrencesQueryOptions(workspaceId, today ?? '', today ? addDays(today, AHEAD_DAYS) : ''),
    enabled: today !== undefined,
  }).data
  if (!accounts || !today || !rule || !ahead) {
    return null
  }
  return (
    <RecurrenceForm
      workspaceId={workspaceId}
      today={today}
      accounts={accounts}
      defaults={recurrenceInputOf(rule)}
      edit={{ ruleId, warning: ownAmountWarningOf(rule, ahead.items) }}
      onClose={onClose}
    />
  )
}

function ownAmountWarningOf(
  rule: ListedRecurrence,
  occurrences: readonly ListedOccurrence[],
): string | undefined {
  const own = occurrences.filter(
    (occurrence) =>
      occurrence.ruleId === rule.id &&
      occurrence.status === 'pending' &&
      occurrence.amountCents !== rule.amountCents,
  )
  const [first, ...rest] = own
  if (!first) {
    return undefined
  }
  return planningMessages.form.ownAmount(
    first.description,
    formatShortDate(first.dueOn),
    formatBrl(first.amountCents),
    rest.length,
  )
}
