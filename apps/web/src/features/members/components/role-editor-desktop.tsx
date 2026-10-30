import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Card } from '@web/components/display/card'
import { InvitationRow } from '@web/components/display/invitation-row'
import { MemberRow } from '@web/components/display/member-row'
import { Alert } from '@web/components/feedback/alert'
import { PageHeader } from '@web/components/layout/page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import {
  invitationsQueryOptions,
  membersQueryOptions,
} from '@web/features/members/api/members.queries'
import { contactOf } from '@web/features/members/components/invitations-list'
import { dayOf } from '@web/features/members/components/member-views'
import { roleUsageText } from '@web/features/members/components/role-views'
import { membersMessages } from '@web/features/members/members.messages'
import type {
  Role,
  RoleEditorDesktopProps,
  RoleUsageCardProps,
} from '@web/features/members/members.types'

const messages = membersMessages.editor

export function RoleEditorDesktop({
  workspaceId,
  role,
  problem,
  identity,
  permissions,
  remove,
  save,
}: RoleEditorDesktopProps) {
  const title = role?.name ?? messages.newTitle
  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb
        label={messages.crumb}
        items={[
          {
            label: membersMessages.title,
            link: <Link to="/w/$workspaceId/members" params={{ workspaceId }} />,
          },
          {
            label: membersMessages.tabs.roles,
            link: <Link to="/w/$workspaceId/members/roles" params={{ workspaceId }} />,
          },
          { label: title },
        ]}
      />
      <PageHeader
        title={title}
        description={role ? roleSubtitleOf(role) : messages.newSubtitle}
        actions={
          <div className="flex items-center gap-3">
            {remove}
            {save}
          </div>
        }
      />
      {role?.systemKey === 'owner' && (
        <Alert tone="neutral" icon="lock">
          {messages.ownerLocked}
        </Alert>
      )}
      {problem && (
        <Alert tone="danger" isUrgent>
          {problem}
        </Alert>
      )}
      <div className="grid grid-cols-5 items-start gap-5">
        <div className="col-span-2 flex flex-col gap-5">
          <Card title={messages.identityCard}>
            <div className="flex flex-col gap-5">{identity}</div>
          </Card>
          {role && <RoleUsageCard workspaceId={workspaceId} role={role} />}
        </div>
        <div className="col-span-3">
          <Card title={messages.permissions}>{permissions}</Card>
        </div>
      </div>
    </div>
  )
}

function RoleUsageCard({ workspaceId, role }: RoleUsageCardProps) {
  const members = useQuery(membersQueryOptions(workspaceId)).data ?? []
  const invitations = useQuery(invitationsQueryOptions(workspaceId)).data ?? []
  const people = members.filter((member) => member.role.roleId === role.roleId)
  const invited = invitations.filter((invitation) => invitation.roleId === role.roleId)
  const inviterOf = (userId: string) =>
    members.find((member) => member.userId === userId)?.displayName ??
    membersMessages.invitations.someone
  return (
    <Card title={messages.usageCard} footerStat={messages.usageNote}>
      {people.length + invited.length === 0 ? (
        <p className="text-body-sm text-ink-muted">{messages.nobodyUses}</p>
      ) : (
        <ul>
          {people.map((member) => (
            <MemberRow
              key={member.membershipId}
              name={member.displayName}
              email={member.email}
              roleName={member.role.name}
              joinedOn={dayOf(member.joinedAt)}
            />
          ))}
          {invited.map((invitation) => (
            <InvitationRow
              key={invitation.invitationId}
              channel={invitation.email ? 'email' : 'phone'}
              contact={contactOf(invitation)}
              roleName={role.name}
              isCustomRole={role.systemKey === null}
              expiresOn={dayOf(invitation.expiresAt)}
              invitedBy={inviterOf(invitation.invitedByUserId)}
              invitedOn={dayOf(invitation.createdAt)}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

function roleSubtitleOf(role: Role): string {
  const type = role.systemKey === null ? messages.customRole : messages.systemRole
  const isUsed = role.memberCount + role.invitationCount > 0
  return `${type} · ${isUsed ? messages.usedBy(roleUsageText(role)) : messages.unused}`
}
