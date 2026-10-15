import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { entryQueryOptions } from '@web/features/entries/api/entries.queries'
import { EntryForm } from '@web/features/entries/components/entry-form'
import { formInputOf } from '@web/features/entries/components/entry-form-values'
import type { NewEntryProps, RepeatedEntryProps } from '@web/features/entries/entries.types'
import { hasPermission } from '@web/lib/permissions'

const TIME_ZONE = 'America/Sao_Paulo'

export function NewEntry(props: NewEntryProps) {
  if (!props.isOpen || !hasPermission(props.permissions, 'entries', 'create')) {
    return null
  }
  if (props.repeatEntryId) {
    return <RepeatedEntry {...props} repeatEntryId={props.repeatEntryId} />
  }
  return <NewEntryForm {...props} />
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

function NewEntryForm({
  workspaceId,
  currentUserId,
  currentUserName,
  permissions,
  prefill,
  onClose,
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
    />
  )
}
