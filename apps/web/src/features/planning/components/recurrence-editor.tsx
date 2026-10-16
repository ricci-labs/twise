import { useQuery } from '@tanstack/react-query'
import {
  accountsQueryOptions,
  periodsQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { RecurrenceForm } from '@web/features/planning/components/recurrence-form'
import { blankRecurrence } from '@web/features/planning/components/recurrence-input'
import { NEW_RECURRENCE } from '@web/features/planning/planning.schemas'
import type {
  NewRecurrenceProps,
  RecurrenceEditorProps,
} from '@web/features/planning/planning.types'
import { hasPermission } from '@web/lib/permissions'

const FIRST_TYPE = 'expense'

export function RecurrenceEditor({
  workspaceId,
  permissions,
  search,
  onClose,
}: RecurrenceEditorProps) {
  const isCreating = search.recurrence === NEW_RECURRENCE
  if (!isCreating || !hasPermission(permissions, 'planning', 'create')) {
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
