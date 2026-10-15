import { useNavigate } from '@tanstack/react-router'
import { showToast } from '@web/components/feedback/toast'
import { useEntryAction } from '@web/features/entries/api/use-entry-action'
import { restoreRefusalOf } from '@web/features/entries/components/trashed-entry-line'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { TrashedEntry } from '@web/features/entries/entries.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useState } from 'react'

const messages = entriesMessages.list.trashPage

export function useEntryRestore(workspaceId: string) {
  const action = useEntryAction(workspaceId)
  const navigate = useNavigate()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function restore(entry: TrashedEntry, accountFirst?: string) {
    setBusyId(entry.id)
    try {
      if (accountFirst) {
        await action.mutateAsync({ action: 'restoreAccount', accountId: accountFirst })
      }
      await action.mutateAsync({ action: 'restore', entryId: entry.id })
      showToast(messages.restored, {
        tone: 'success',
        action: {
          label: messages.see,
          onPress: () =>
            void navigate({
              to: '/w/$workspaceId/entries/$entry',
              params: { workspaceId, entry: entry.id },
            }),
        },
      })
    } catch (error) {
      refused(entry, error)
    } finally {
      setBusyId(null)
    }
  }

  function refused(entry: TrashedEntry, error: unknown) {
    const refusal = restoreRefusalOf(error)
    const account = refusal?.account
    showToast(refusal?.message ?? errorMessageFor(error), {
      tone: 'danger',
      action: account && {
        label: messages.restoreAccount(account.name),
        onPress: () => void restore(entry, account.id),
      },
    })
  }

  return { busyId, restore: (entry: TrashedEntry) => void restore(entry) }
}
