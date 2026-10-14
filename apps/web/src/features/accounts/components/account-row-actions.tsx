import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  AccountAction,
  AccountActionHandlers,
  AccountRowActionsProps,
  ListedAccount,
} from '@web/features/accounts/accounts.types'
import { useAccountAction } from '@web/features/accounts/api/use-account-action'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = accountsMessages
const CANNOT_BE_DELETED = 'ACCOUNT_CANNOT_BE_DELETED'

export function AccountRowActions({ workspaceId, permissions, account }: AccountRowActionsProps) {
  const { mutateAsync } = useAccountAction(workspaceId)
  const [isRefused, setIsRefused] = useState(false)
  const canUpdate = hasPermission(permissions, 'accounts', 'update')
  const canDelete = hasPermission(permissions, 'accounts', 'delete')

  async function run(action: AccountAction, onDone: () => void) {
    try {
      await mutateAsync({ action, accountId: account.id })
      onDone()
    } catch (error) {
      if (error instanceof ApiError && error.code === CANNOT_BE_DELETED) {
        setIsRefused(true)
        return
      }
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const archive = () =>
    run('archive', () =>
      showToast(messages.toasts.archived(account.name, account.isCard), {
        tone: 'success',
        action: { label: messages.toasts.undo, onPress: () => run('unarchive', () => undefined) },
      }),
    )
  const unarchive = () =>
    run('unarchive', () =>
      showToast(messages.toasts.unarchived(account.name, account.isCard), { tone: 'success' }),
    )
  const remove = () =>
    run('delete', () =>
      showToast(messages.toasts.deleted(account.isCard), {
        tone: 'success',
        action: { label: messages.toasts.undo, onPress: () => run('restore', () => undefined) },
      }),
    )

  const actions = actionsOf(account, { canUpdate, canDelete, archive, unarchive, remove })
  return (
    <>
      <ItemActions
        title={account.name}
        triggerLabel={messages.actions.trigger(account.name)}
        actions={actions}
      />
      <ConfirmDialog
        title={refusedTitleOf(account)}
        description={messages.refusedDelete.text}
        cancelLabel={messages.refusedDelete.cancel}
        confirmLabel={messages.refusedDelete.archive}
        confirmVariant="primary"
        confirmIcon="archive"
        isOpen={isRefused}
        onOpenChange={setIsRefused}
        onConfirm={() => {
          setIsRefused(false)
          void archive()
        }}
      />
    </>
  )
}

function actionsOf(account: ListedAccount, can: AccountActionHandlers): ItemAction[] {
  if (account.isArchived) {
    return can.canUpdate
      ? [
          {
            key: 'unarchive',
            label: messages.actions.unarchive,
            icon: 'unarchive',
            onSelect: can.unarchive,
          },
        ]
      : []
  }
  return [
    ...(can.canUpdate
      ? [
          {
            key: 'archive',
            label: messages.actions.archive,
            icon: 'archive',
            onSelect: can.archive,
          } as const,
        ]
      : []),
    ...(can.canDelete
      ? [
          {
            key: 'delete',
            label: messages.actions.delete,
            icon: 'trash',
            tone: 'danger',
            onSelect: can.remove,
          } as const,
        ]
      : []),
  ]
}

function refusedTitleOf(account: ListedAccount): string {
  return account.isCard
    ? messages.refusedDelete.titleCard(account.name)
    : messages.refusedDelete.title(account.name)
}
