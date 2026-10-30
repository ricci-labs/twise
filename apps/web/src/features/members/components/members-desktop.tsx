import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { TextLink } from '@web/components/actions/text-link'
import { Avatar } from '@web/components/display/avatar'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { DataTable } from '@web/components/display/data-table'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { TileGrid } from '@web/components/layout/tile-grid'
import { SettingsRow } from '@web/components/navigation/settings-row'
import {
  invitationsQueryOptions,
  membersQueryOptions,
  rolesQueryOptions,
} from '@web/features/members/api/members.queries'
import { contactOf, InvitationActions } from '@web/features/members/components/invitations-list'
import { MemberActions } from '@web/features/members/components/member-actions'
import { dayOf, lastActivityText } from '@web/features/members/components/member-views'
import { roleTypeText, roleUsageText } from '@web/features/members/components/role-views'
import { membersMessages } from '@web/features/members/members.messages'
import type {
  InvitationsCardProps,
  MembersCardProps,
  MembersDesktopProps,
  PersonCellProps,
  RolesCardProps,
} from '@web/features/members/members.types'
import { ApiError } from '@web/lib/api/api-error'
import { formatFullDate, formatShortDate } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'
import { Mail, Phone } from 'lucide-react'
import { useState } from 'react'

const messages = membersMessages.desktop
const columns = messages.columns
const PAGE_SIZE = 50
const INVITATIONS_SHOWN = 4
const ROLES_SHOWN = 6
const SKELETON_LINES = 6
const OWNER = 'owner'
const TIME_ZONE = 'America/Sao_Paulo'

export function MembersDesktop({
  workspaceId,
  workspaceName,
  membershipId,
  permissions,
}: MembersDesktopProps) {
  const members = useQuery(membersQueryOptions(workspaceId))
  if (members.isError) {
    return (
      <SectionError
        message={membersMessages.failed}
        errorRef={members.error instanceof ApiError ? members.error.ref : null}
        isRetrying={members.isFetching}
        onRetry={() => void members.refetch()}
      />
    )
  }
  if (!members.data) {
    return <SectionSkeleton lines={SKELETON_LINES} />
  }
  return (
    <div className="flex flex-col gap-5">
      <MembersCard
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        membershipId={membershipId}
        permissions={permissions}
        members={members.data}
      />
      <InvitationsCard
        workspaceId={workspaceId}
        members={members.data}
        canRevoke={hasPermission(permissions, 'members', 'delete')}
      />
      <RolesCard workspaceId={workspaceId} />
    </div>
  )
}

function MembersCard({
  workspaceId,
  workspaceName,
  membershipId,
  permissions,
  members,
}: MembersCardProps) {
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  const today = todayIn(TIME_ZONE, new Date())
  const isActorOwner = members.some(
    (member) => member.membershipId === membershipId && member.role.systemKey === OWNER,
  )
  const hiddenCount = members.length - shownCount
  return (
    <Card title={messages.members(members.length)} description={messages.membersNote}>
      <DataTable
        label={membersMessages.title}
        layout="people"
        columns={[
          { key: 'person', label: columns.person },
          { key: 'role', label: columns.role },
          { key: 'since', label: columns.since },
          { key: 'activity', label: columns.lastActivity },
          { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
        ]}
        rows={members.slice(0, shownCount).map((member) => ({
          key: member.membershipId,
          cells: [
            <PersonCell
              key="person"
              member={member}
              isYou={member.membershipId === membershipId}
            />,
            <Badge key="role" tone="success" size="status" hasDot>
              {member.role.name}
            </Badge>,
            formatFullDate(dayOf(member.joinedAt)),
            lastActivityText(member.lastActivityAt, today),
            <MemberActions
              key="actions"
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              member={member}
              members={members}
              isYou={member.membershipId === membershipId}
              canRemove={hasPermission(permissions, 'members', 'delete')}
              canChangeRole={hasPermission(permissions, 'members', 'update')}
              actorPermissions={permissions}
              isActorOwner={isActorOwner}
            />,
          ],
        }))}
      />
      {hiddenCount > 0 && (
        <ShowMoreButton
          hiddenCount={hiddenCount}
          onClick={() => setShownCount((count) => count + PAGE_SIZE)}
        />
      )}
    </Card>
  )
}

function PersonCell({ member, isYou }: PersonCellProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={member.displayName} size="lg" />
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-row font-semibold text-ink">{member.displayName}</span>
          {isYou && <Badge size="tiny">{membersMessages.you}</Badge>}
        </span>
        <span className="truncate text-row-detail text-ink-muted">{member.email}</span>
      </span>
    </span>
  )
}

function InvitationsCard({ workspaceId, members, canRevoke }: InvitationsCardProps) {
  const invitations = useQuery(invitationsQueryOptions(workspaceId)).data ?? []
  const roles = useQuery(rolesQueryOptions(workspaceId)).data ?? []
  if (invitations.length === 0) {
    return null
  }
  return (
    <Card
      title={messages.invitations(invitations.length)}
      description={messages.invitationsNote}
      footerAction={
        invitations.length > INVITATIONS_SHOWN && (
          <TextLink
            render={<Link to="/w/$workspaceId/members/invitations" params={{ workspaceId }} />}
          >
            {messages.seeAllInvitations(invitations.length)}
          </TextLink>
        )
      }
    >
      <DataTable
        label={membersMessages.tabs.invitations}
        layout="people"
        columns={[
          { key: 'contact', label: columns.invitedContact },
          { key: 'role', label: columns.role },
          { key: 'until', label: columns.validUntil },
          { key: 'by', label: columns.invitedBy },
          { key: 'actions', label: columns.actions, isLabelHidden: true, isActions: true },
        ]}
        rows={invitations.slice(0, INVITATIONS_SHOWN).map((invitation) => {
          const role = roles.find((candidate) => candidate.roleId === invitation.roleId)
          const inviter = members.find((member) => member.userId === invitation.invitedByUserId)
          const contact = contactOf(invitation)
          return {
            key: invitation.invitationId,
            cells: [
              <span key="contact" className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sunken [&>svg]:size-4.5">
                  {invitation.email ? <Mail aria-hidden="true" /> : <Phone aria-hidden="true" />}
                </span>
                <span className="truncate text-row font-semibold text-ink">{contact}</span>
              </span>,
              <Badge
                key="role"
                tone={role?.systemKey === null ? 'partial' : 'neutral'}
                size="status"
                hasDot
              >
                {role?.name ?? ''}
              </Badge>,
              formatShortDate(dayOf(invitation.expiresAt)),
              <span key="by" className="flex flex-col">
                <span>{inviter?.displayName ?? membersMessages.invitations.someone}</span>
                <span className="text-note text-ink-muted">
                  {messages.invitedOn(formatShortDate(dayOf(invitation.createdAt)))}
                </span>
              </span>,
              canRevoke ? (
                <InvitationActions
                  key="actions"
                  workspaceId={workspaceId}
                  contact={contact}
                  invitationId={invitation.invitationId}
                />
              ) : null,
            ],
          }
        })}
      />
    </Card>
  )
}

function RolesCard({ workspaceId }: RolesCardProps) {
  const roles = useQuery(rolesQueryOptions(workspaceId)).data ?? []
  if (roles.length === 0) {
    return null
  }
  return (
    <Card
      title={messages.roles(roles.length)}
      description={messages.rolesNote}
      footerAction={
        roles.length > ROLES_SHOWN && (
          <TextLink render={<Link to="/w/$workspaceId/members/roles" params={{ workspaceId }} />}>
            {messages.seeAllRoles}
          </TextLink>
        )
      }
    >
      <TileGrid density="compact" render={<ul />}>
        {roles.slice(0, ROLES_SHOWN).map((role) => (
          <SettingsRow
            key={role.roleId}
            variant="tile"
            title={role.name}
            detail={`${roleTypeText(role)} · ${roleUsageText(role)}`}
            link={
              <Link
                to="/w/$workspaceId/members/roles/$role"
                params={{ workspaceId, role: role.roleId }}
              />
            }
          />
        ))}
      </TileGrid>
    </Card>
  )
}
