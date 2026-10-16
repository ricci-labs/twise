import { parseIsoDate } from '@financas/shared'
import { ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { useDeleteHoliday } from '@web/features/settings/api/use-delete-holiday'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type { HolidayActionsProps } from '@web/features/settings/settings.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatShortDate } from '@web/lib/format/calendar'
import { useState } from 'react'

const messages = settingsMessages.holidays

export function HolidayActions({ workspaceId, holiday }: HolidayActionsProps) {
  const remove = useDeleteHoliday(workspaceId)
  const [isConfirming, setIsConfirming] = useState(false)

  async function confirmRemove(holidayId: string) {
    try {
      await remove.mutateAsync(holidayId)
      setIsConfirming(false)
      showToast(messages.removed, { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const { holidayId } = holiday
  if (!holidayId) {
    return null
  }
  return (
    <>
      <ItemActions
        title={holiday.name}
        triggerLabel={messages.actions.trigger(holiday.name)}
        actions={[
          {
            key: 'remove',
            label: messages.actions.remove,
            icon: 'trash',
            tone: 'danger',
            onSelect: () => setIsConfirming(true),
          },
        ]}
      />
      <ConfirmDialog
        title={messages.removeTitle(holiday.name, formatShortDate(holiday.onDate))}
        description={messages.removeText(parseIsoDate(holiday.onDate).day)}
        cancelLabel={messages.cancel}
        confirmLabel={messages.actions.remove}
        confirmVariant="danger"
        isOpen={isConfirming}
        onOpenChange={setIsConfirming}
        onConfirm={() => void confirmRemove(holidayId)}
      />
    </>
  )
}
