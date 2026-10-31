import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ItemActions } from '@web/components/actions/item-actions'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { showToast } from '@web/components/feedback/toast'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import {
  invitationsQueryOptions,
  membersQueryOptions,
} from '@web/features/members/api/members.queries'
import { useDeleteRole } from '@web/features/members/api/use-delete-role'
import { membersMessages } from '@web/features/members/members.messages'
import type { RoleDeleteDialog, RoleDeleteProps } from '@web/features/members/members.types'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatPhone } from '@web/lib/format/phone'
import { useState } from 'react'

const messages = membersMessages.editor
const NAME_SEPARATOR = ', '

export function RoleDelete({ workspaceId, role, isMenu = false }: RoleDeleteProps) {
  const navigate = useNavigate()
  const [dialog, setDialog] = useState<RoleDeleteDialog>(null)
  const remove = useDeleteRole(workspaceId)
  const invitations = useQuery(invitationsQueryOptions(workspaceId)).data ?? []
  const members = useQuery(membersQueryOptions(workspaceId)).data ?? []
  const invitedWith = invitations.filter((invitation) => invitation.roleId === role.roleId)
  const membersWith = members.filter((member) => member.role.roleId === role.roleId)
  const isInUse = invitedWith.length > 0 || membersWith.length > 0
  const isByInvitations = invitedWith.length > 0

  async function confirmDelete() {
    setDialog(null)
    try {
      await remove.mutateAsync(role.roleId)
      showToast(messages.deleted(role.name), { tone: 'success' })
      await navigate({ to: '/w/$workspaceId/members/roles', params: { workspaceId } })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  function seeWhoUsesIt() {
    setDialog(null)
    void navigate({
      to: isByInvitations ? '/w/$workspaceId/members/invitations' : '/w/$workspaceId/members',
      params: { workspaceId },
    })
  }

  const inUseText = isByInvitations
    ? messages.inUseByInvitations(
        invitedWith.length,
        invitedWith
          .map((invitation) => invitation.email ?? formatPhone(invitation.phoneE164 ?? ''))
          .join(NAME_SEPARATOR),
      )
    : messages.inUseByMembers(
        membersWith.length,
        membersWith.map((member) => member.displayName).join(NAME_SEPARATOR),
      )
  return (
    <>
      {isMenu ? (
        <ItemActions
          title={role.name}
          triggerLabel={messages.roleActions(role.name)}
          actions={[
            {
              key: 'delete',
              label: messages.delete,
              icon: 'trash',
              tone: 'danger',
              onSelect: () => setDialog(isInUse ? 'inUse' : 'confirm'),
            },
          ]}
        />
      ) : (
        <Button
          variant="dangerText"
          className="-ml-3 self-start"
          onClick={() => setDialog(isInUse ? 'inUse' : 'confirm')}
        >
          <TwiseIcon name="trash" size="sm" />
          {messages.delete}
        </Button>
      )}
      <ConfirmDialog
        title={messages.deleteTitle(role.name)}
        description={messages.deleteText}
        cancelLabel={messages.cancel}
        confirmLabel={messages.delete}
        isOpen={dialog === 'confirm'}
        onOpenChange={(isOpen) => setDialog(isOpen ? 'confirm' : null)}
        onConfirm={() => void confirmDelete()}
      />
      <ConfirmDialog
        title={messages.inUseTitle(role.name)}
        description={inUseText}
        cancelLabel={messages.cancel}
        confirmLabel={isByInvitations ? messages.seeInvitations : messages.seeMembers}
        confirmVariant="primary"
        isOpen={dialog === 'inUse'}
        onOpenChange={(isOpen) => setDialog(isOpen ? 'inUse' : null)}
        onConfirm={seeWhoUsesIt}
      />
    </>
  )
}
