import { Link } from '@tanstack/react-router'
import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { useDeleteRecurrence } from '@web/features/planning/api/use-delete-recurrence'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { RecurrenceActionsProps } from '@web/features/planning/planning.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useState } from 'react'

const messages = planningMessages.recurrences

export function RecurrenceActions({
  workspaceId,
  recurrence,
  canDelete,
  triggerLabel,
  className,
  children,
}: RecurrenceActionsProps) {
  const remove = useDeleteRecurrence(workspaceId)
  const [isConfirming, setIsConfirming] = useState(false)

  async function confirmRemove() {
    try {
      await remove.mutateAsync(recurrence.id)
      setIsConfirming(false)
      showToast(messages.removed(recurrence.description), { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const actions: ItemAction[] = [
    {
      key: 'occurrences',
      label: messages.actions.seeOccurrences,
      icon: 'list',
      render: (
        <Link
          to="/w/$workspaceId/planning/$tab"
          params={{ workspaceId, tab: 'occurrences' }}
          search={(previous) => ({ ...previous, rule: recurrence.id })}
        />
      ),
    },
    {
      key: 'edit',
      label: messages.actions.edit,
      icon: 'edit',
      render: <Link to="." search={(previous) => ({ ...previous, recurrence: recurrence.id })} />,
    },
    ...(canDelete
      ? [
          {
            key: 'remove',
            label: messages.actions.remove,
            icon: 'trash',
            tone: 'danger',
            onSelect: () => setIsConfirming(true),
          } as const,
        ]
      : []),
  ]
  return (
    <>
      <ItemActions
        title={recurrence.description}
        triggerLabel={messages.actions.trigger(recurrence.description)}
        actions={actions}
        align="start"
        trigger={
          <button type="button" aria-label={triggerLabel} className={className}>
            {children}
          </button>
        }
      />
      <ConfirmDialog
        title={messages.removeTitle(recurrence.description)}
        description={messages.removeText}
        cancelLabel={messages.cancel}
        confirmLabel={messages.actions.remove}
        confirmVariant="danger"
        isOpen={isConfirming}
        onOpenChange={setIsConfirming}
        onConfirm={() => void confirmRemove()}
      />
    </>
  )
}
