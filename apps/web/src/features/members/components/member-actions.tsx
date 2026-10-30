import { DELETE_REASON_MAX_LENGTH } from '@financas/shared'
import { useNavigate } from '@tanstack/react-router'
import { ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { TextArea } from '@web/components/inputs/text-area'
import { useChangeMemberRole } from '@web/features/members/api/use-change-member-role'
import { useLeaveWorkspace } from '@web/features/members/api/use-leave-workspace'
import { useRemoveMember } from '@web/features/members/api/use-remove-member'
import { membersMessages } from '@web/features/members/members.messages'
import type { MemberActionsProps, MemberDialog } from '@web/features/members/members.types'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { useId, useState } from 'react'

const messages = membersMessages
const LAST_OWNER = 'LAST_OWNER'

export function MemberActions({
  workspaceId,
  workspaceName,
  member,
  members,
  isYou,
  canRemove,
}: MemberActionsProps) {
  const [dialog, setDialog] = useState<MemberDialog>(null)
  const [reason, setReason] = useState('')
  const reasonId = useId()
  const navigate = useNavigate()
  const remove = useRemoveMember(workspaceId)
  const leave = useLeaveWorkspace(workspaceId)
  const changeRole = useChangeMemberRole(workspaceId)
  const successor = members.find((other) => other.membershipId !== member.membershipId)

  async function confirmRemove() {
    try {
      const trimmed = reason.trim()
      await remove.mutateAsync({
        membershipId: member.membershipId,
        reason: trimmed === '' ? undefined : trimmed,
      })
      setDialog(null)
      showToast(messages.remove.done(member.displayName), { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  async function confirmLeave() {
    try {
      await leave.mutateAsync()
      setDialog(null)
      showToast(messages.leave.done(workspaceName), { tone: 'success' })
      await navigate({ to: '/workspaces' })
    } catch (error) {
      if (error instanceof ApiError && error.code === LAST_OWNER && successor) {
        setDialog('lastOwner')
        return
      }
      setDialog(null)
      showToast(
        error instanceof ApiError && error.code === LAST_OWNER
          ? messages.lastOwner.alone
          : errorMessageFor(error),
        { tone: 'danger' },
      )
    }
  }

  async function promoteSuccessor() {
    if (!successor) {
      return
    }
    try {
      await changeRole.mutateAsync({
        membershipId: successor.membershipId,
        roleId: member.role.roleId,
      })
      setDialog(null)
      showToast(messages.lastOwner.promoted(successor.displayName), { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  const actions = isYou
    ? [
        {
          key: 'leave',
          label: messages.actions.leave,
          icon: 'out' as const,
          tone: 'danger' as const,
          onSelect: () => setDialog('leave'),
        },
      ]
    : [
        {
          key: 'remove',
          label: messages.actions.remove,
          icon: 'trash' as const,
          tone: 'danger' as const,
          onSelect: () => {
            setReason('')
            setDialog('remove')
          },
        },
      ]
  if (!isYou && !canRemove) {
    return null
  }

  const close = (isOpen: boolean) => setDialog(isOpen ? dialog : null)
  return (
    <>
      <ItemActions
        title={member.displayName}
        triggerLabel={messages.actions.trigger(member.displayName)}
        actions={actions}
      />
      <ConfirmDialog
        title={messages.remove.title(member.displayName)}
        description={messages.remove.text}
        cancelLabel={messages.remove.cancel}
        confirmLabel={messages.remove.confirm}
        isOpen={dialog === 'remove'}
        onOpenChange={close}
        onConfirm={() => void confirmRemove()}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={reasonId} className="text-label font-medium text-ink">
            {messages.remove.reason}
          </label>
          <TextArea
            id={reasonId}
            placeholder={messages.remove.reasonPlaceholder}
            maxLength={DELETE_REASON_MAX_LENGTH}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        title={messages.leave.title(workspaceName)}
        description={messages.leave.text}
        cancelLabel={messages.leave.cancel}
        confirmLabel={messages.leave.confirm}
        isOpen={dialog === 'leave'}
        onOpenChange={close}
        onConfirm={() => void confirmLeave()}
      />
      <ConfirmDialog
        title={messages.lastOwner.title(workspaceName)}
        description={messages.lastOwner.text(successor?.displayName ?? '')}
        cancelLabel={messages.lastOwner.cancel}
        confirmLabel={messages.lastOwner.promote(successor?.displayName ?? '')}
        confirmVariant="primary"
        isOpen={dialog === 'lastOwner'}
        onOpenChange={close}
        onConfirm={() => void promoteSuccessor()}
      />
    </>
  )
}
