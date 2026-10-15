import { DELETE_REASON_MAX_LENGTH } from '@financas/shared'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { type ItemAction, ItemActions } from '@web/components/actions/item-actions'
import { showToast } from '@web/components/feedback/toast'
import { TextArea } from '@web/components/inputs/text-area'
import { Sheet } from '@web/components/layout/sheet'
import { useEntryAction } from '@web/features/entries/api/use-entry-action'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  DeleteReasonSheetProps,
  EntryDetailActionsProps,
} from '@web/features/entries/entries.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useId, useState } from 'react'

const messages = entriesMessages.list.detail

export function EntryDetailActions({
  workspaceId,
  permissions,
  entry,
  isOnClosedInvoice,
}: EntryDetailActionsProps) {
  const navigate = useNavigate()
  const action = useEntryAction(workspaceId)
  const [isAskingReason, setIsAskingReason] = useState(false)

  async function restore() {
    try {
      await action.mutateAsync({ action: 'restore', entryId: entry.id })
      showToast(messages.restored, { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  async function remove(reason?: string) {
    try {
      await action.mutateAsync({ action: 'delete', entryId: entry.id, reason })
      setIsAskingReason(false)
      await navigate({ to: '/w/$workspaceId/entries', params: { workspaceId } })
      showToast(messages.deleted, {
        tone: 'success',
        action: { label: messages.undo, onPress: () => void restore() },
      })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const canDelete = hasPermission(permissions, 'entries', 'delete') && !isOnClosedInvoice
  const actions: ItemAction[] = [
    ...(hasPermission(permissions, 'entries', 'create')
      ? [
          {
            key: 'repeat',
            label: messages.actions.repeat,
            icon: 'refresh',
            render: (
              <Link
                to="."
                search={(previous) => ({ ...previous, entry: 'new', entryRepeat: entry.id })}
              />
            ),
          } as const,
        ]
      : []),
    ...(hasPermission(permissions, 'attachments', 'create')
      ? [
          {
            key: 'attach',
            label: messages.actions.attach,
            icon: 'plus',
            render: (
              <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'attachments' }} />
            ),
          } as const,
        ]
      : []),
    ...(canDelete
      ? [
          {
            key: 'delete-with-reason',
            label: messages.actions.deleteWithReason,
            icon: 'trash',
            onSelect: () => setIsAskingReason(true),
          } as const,
          {
            key: 'delete',
            label: messages.actions.delete,
            icon: 'trash',
            tone: 'danger',
            onSelect: () => void remove(),
          } as const,
        ]
      : []),
  ]
  if (actions.length === 0) {
    return null
  }
  return (
    <>
      <ItemActions
        title={entry.description}
        triggerLabel={messages.actions.trigger}
        actions={actions}
      />
      <DeleteReasonSheet
        description={entry.description}
        isOpen={isAskingReason}
        isDeleting={action.isPending}
        onOpenChange={setIsAskingReason}
        onDelete={(reason) => void remove(reason)}
      />
    </>
  )
}

function DeleteReasonSheet({
  description,
  isOpen,
  isDeleting,
  onOpenChange,
  onDelete,
}: DeleteReasonSheetProps) {
  const [reason, setReason] = useState('')
  const fieldId = useId()
  const helpId = useId()
  const copy = messages.reason
  return (
    <Sheet
      title={copy.title(description)}
      description={copy.text}
      closeLabel={copy.cancel}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={fieldId} className="text-label font-medium text-ink">
            {copy.label}
          </label>
          <p id={helpId} className="text-note text-ink-muted">
            {copy.help}
          </p>
          <TextArea
            id={fieldId}
            aria-describedby={helpId}
            maxLength={DELETE_REASON_MAX_LENGTH}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {copy.cancel}
          </Button>
          <Button
            variant="danger"
            isLoading={isDeleting}
            onClick={() => onDelete(reason.trim() === '' ? undefined : reason.trim())}
          >
            {copy.confirm}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
