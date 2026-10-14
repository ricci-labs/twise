import { useNavigate } from '@tanstack/react-router'
import { showToast } from '@web/components/feedback/toast'
import { AccountGroup } from '@web/components/finance/account-group'
import { TrashRow } from '@web/components/finance/trash-row'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { TrashedItem, TrashListProps } from '@web/features/accounts/accounts.types'
import { useAccountAction } from '@web/features/accounts/api/use-account-action'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useState } from 'react'

const messages = accountsMessages.trashPage
const PARENT_IN_TRASH = 'ACCOUNT_CANNOT_BE_RESTORED'
const NAME_TAKEN = 'ACCOUNT_NAME_TAKEN'

export function TrashList({ workspaceId, items }: TrashListProps) {
  const { mutateAsync } = useAccountAction(workspaceId)
  const navigate = useNavigate()
  const [busyId, setBusyId] = useState<string | null>(null)

  function see(item: TrashedItem) {
    if (item.isListedInAccounts) {
      void navigate({
        to: '/w/$workspaceId/accounts',
        params: { workspaceId },
        search: { created: item.id },
      })
      return
    }
    void navigate({ to: '/w/$workspaceId/$area', params: { workspaceId, area: 'categories' } })
  }

  async function restore(item: TrashedItem, parentFirst?: TrashedItem['parent']) {
    setBusyId(item.id)
    try {
      if (parentFirst) {
        await mutateAsync({ action: 'restore', accountId: parentFirst.id })
      }
      await mutateAsync({ action: 'restore', accountId: item.id })
      showToast(item.restoredMessage, {
        tone: 'success',
        action: { label: messages.see, onPress: () => see(item) },
      })
    } catch (error) {
      refused(item, error)
    } finally {
      setBusyId(null)
    }
  }

  function refused(item: TrashedItem, error: unknown) {
    const code = error instanceof ApiError ? error.code : null
    const parent = item.parent
    if (code === PARENT_IN_TRASH && parent?.isInTrash) {
      showToast(messages.parentInTrash(parent.name, parent.isCategory), {
        tone: 'danger',
        action: { label: messages.restoreBoth, onPress: () => void restore(item, parent) },
      })
      return
    }
    showToast(code === NAME_TAKEN ? messages.nameTaken : errorMessageFor(error), {
      tone: 'danger',
    })
  }

  return (
    <AccountGroup>
      {items.map((item) => (
        <TrashRow
          key={item.id}
          name={item.name}
          icon={item.icon}
          details={[item.kindLine, item.deletedLine]}
          note={item.reason}
          actionLabel={messages.restore}
          actionAccessibleLabel={messages.restoreLabel(item.name)}
          isBusy={busyId === item.id}
          onAction={() => void restore(item)}
        />
      ))}
    </AccountGroup>
  )
}
