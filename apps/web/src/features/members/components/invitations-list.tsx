import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { ItemActions } from '@web/components/actions/item-actions'
import { InvitationRow } from '@web/components/display/invitation-row'
import { ConfirmDialog } from '@web/components/feedback/confirm-dialog'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { AccountGroup } from '@web/components/finance/account-group'
import {
  invitationsQueryOptions,
  membersQueryOptions,
  rolesQueryOptions,
} from '@web/features/members/api/members.queries'
import { useRevokeInvitation } from '@web/features/members/api/use-revoke-invitation'
import { membersMessages } from '@web/features/members/members.messages'
import type {
  Invitation,
  InvitationActionsProps,
  InvitationsListProps,
} from '@web/features/members/members.types'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { formatPhone } from '@web/lib/format/phone'
import { useState } from 'react'

const messages = membersMessages.invitations
const SKELETON_LINES = 4
const TIME_ZONE = 'America/Sao_Paulo'

export function InvitationsList({ workspaceId, canRevoke }: InvitationsListProps) {
  const invitations = useQuery(invitationsQueryOptions(workspaceId))
  const roles = useQuery(rolesQueryOptions(workspaceId)).data ?? []
  const members = useQuery(membersQueryOptions(workspaceId)).data ?? []
  if (invitations.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={invitations.error instanceof ApiError ? invitations.error.ref : null}
        isRetrying={invitations.isFetching}
        onRetry={() => void invitations.refetch()}
      />
    )
  }
  if (!invitations.data) {
    return <SectionSkeleton lines={SKELETON_LINES} />
  }
  if (invitations.data.length === 0) {
    return <EmptyBlock icon="together" title={messages.emptyTitle} text={messages.emptyText} />
  }
  return (
    <div className="lg:max-w-160">
      <AccountGroup title={messages.pending} note={messages.note}>
        {invitations.data.map((invitation) => {
          const role = roles.find((candidate) => candidate.roleId === invitation.roleId)
          const inviter = members.find((member) => member.userId === invitation.invitedByUserId)
          const contact = contactOf(invitation)
          return (
            <InvitationRow
              key={invitation.invitationId}
              channel={invitation.email ? 'email' : 'phone'}
              contact={contact}
              roleName={role?.name ?? ''}
              isCustomRole={role?.systemKey === null}
              expiresOn={todayIn(TIME_ZONE, new Date(invitation.expiresAt))}
              invitedBy={inviter?.displayName ?? messages.someone}
              invitedOn={todayIn(TIME_ZONE, new Date(invitation.createdAt))}
              actions={
                canRevoke && (
                  <InvitationActions
                    workspaceId={workspaceId}
                    contact={contact}
                    invitationId={invitation.invitationId}
                  />
                )
              }
            />
          )
        })}
      </AccountGroup>
    </div>
  )
}

function InvitationActions({ workspaceId, contact, invitationId }: InvitationActionsProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const revoke = useRevokeInvitation(workspaceId)

  async function confirmRevoke() {
    setIsConfirming(false)
    try {
      await revoke.mutateAsync(invitationId)
      showToast(messages.revoked, { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  return (
    <>
      <ItemActions
        title={contact}
        triggerLabel={messages.actions(contact)}
        actions={[
          {
            key: 'revoke',
            label: messages.revoke,
            icon: 'trash',
            tone: 'danger',
            onSelect: () => setIsConfirming(true),
          },
        ]}
      />
      <ConfirmDialog
        title={messages.revokeTitle(contact)}
        description={messages.revokeText}
        cancelLabel={messages.cancel}
        confirmLabel={messages.revoke}
        isOpen={isConfirming}
        onOpenChange={setIsConfirming}
        onConfirm={() => void confirmRevoke()}
      />
    </>
  )
}

function contactOf(invitation: Invitation): string {
  return invitation.email ?? formatPhone(invitation.phoneE164 ?? '')
}
