import { todayIn } from '@financas/shared'
import { EntryForm } from '@web/features/entries/components/entry-form'
import type { NewEntryProps } from '@web/features/entries/entries.types'
import { hasPermission } from '@web/lib/permissions'

const TIME_ZONE = 'America/Sao_Paulo'

export function NewEntry({
  workspaceId,
  currentUserId,
  currentUserName,
  permissions,
  isOpen,
  prefill,
  onClose,
}: NewEntryProps) {
  if (!isOpen || !hasPermission(permissions, 'entries', 'create')) {
    return null
  }
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
