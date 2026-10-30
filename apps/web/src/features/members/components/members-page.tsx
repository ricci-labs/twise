import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { SegmentedControl } from '@web/components/actions/segmented-control'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { MemberRow } from '@web/components/display/member-row'
import { RoleCard } from '@web/components/display/role-card'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { AccountGroup } from '@web/components/finance/account-group'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import {
  invitationsQueryOptions,
  membersQueryOptions,
  rolesQueryOptions,
} from '@web/features/members/api/members.queries'
import { InvitationsList } from '@web/features/members/components/invitations-list'
import { MemberActions } from '@web/features/members/components/member-actions'
import { MembersDesktop } from '@web/features/members/components/members-desktop'
import { roleSentence } from '@web/features/members/components/role-views'
import { RolesDesktop } from '@web/features/members/components/roles-desktop'
import { membersMessages as messages } from '@web/features/members/members.messages'
import type {
  HeaderActionProps,
  MembersListProps,
  MembersPageProps,
  MembersTab,
  MembersTabBodyProps,
  MembersTabsProps,
  RolesListProps,
} from '@web/features/members/members.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { ChevronRight, Plus, UserPlus } from 'lucide-react'
import { useState } from 'react'

const PAGE_SIZE = 50
const TAB_PATHS = {
  members: '/w/$workspaceId/members',
  roles: '/w/$workspaceId/members/roles',
  invitations: '/w/$workspaceId/members/invitations',
} as const
const OWNER = 'owner'
const SKELETON_LINES = 6
const TIME_ZONE = 'America/Sao_Paulo'

export function MembersPage(props: MembersPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const { tab, workspaceId, workspaceName, permissions } = props
  return (
    <PageFrame className="gap-4 lg:gap-6">
      <PageHeader
        title={messages.title}
        description={messages.desktop.lead(workspaceName)}
        actions={
          hasPermission(permissions, 'members', 'create') && (
            <HeaderAction tab={tab} workspaceId={workspaceId} isDesktop={isDesktop} />
          )
        }
      />
      <MembersTabs workspaceId={workspaceId} value={tab} isDesktop={isDesktop} />
      <MembersTabBody {...props} isDesktop={isDesktop} />
    </PageFrame>
  )
}

function HeaderAction({ tab, workspaceId, isDesktop }: HeaderActionProps) {
  const look = {
    variant: isDesktop ? 'primary' : 'secondary',
    size: isDesktop ? 'md' : 'sm',
  } as const
  if (tab === 'roles') {
    return (
      <Button
        {...look}
        render={<Link to="/w/$workspaceId/members/roles/new" params={{ workspaceId }} />}
      >
        <Plus aria-hidden="true" />
        {messages.newRole}
      </Button>
    )
  }
  return (
    <Button
      {...look}
      render={<Link to="/w/$workspaceId/members/invitations/new" params={{ workspaceId }} />}
    >
      <UserPlus aria-hidden="true" />
      {messages.invite.open}
    </Button>
  )
}

function MembersTabBody({
  tab,
  workspaceId,
  workspaceName,
  membershipId,
  permissions,
  isDesktop,
}: MembersTabBodyProps) {
  if (tab === 'invitations') {
    return (
      <InvitationsList
        workspaceId={workspaceId}
        canRevoke={hasPermission(permissions, 'members', 'delete')}
      />
    )
  }
  if (tab === 'roles' && isDesktop) {
    return (
      <RolesDesktop
        workspaceId={workspaceId}
        canEdit={hasPermission(permissions, 'members', 'update')}
      />
    )
  }
  if (tab === 'roles') {
    return (
      <RolesList
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        canEdit={hasPermission(permissions, 'members', 'update')}
      />
    )
  }
  const List = isDesktop ? MembersDesktop : MembersList
  return (
    <List
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      membershipId={membershipId}
      permissions={permissions}
    />
  )
}

function MembersTabs({ workspaceId, value, isDesktop }: MembersTabsProps) {
  const navigate = useNavigate()
  const pending = useQuery(invitationsQueryOptions(workspaceId)).data?.length ?? 0
  return (
    <SegmentedControl
      label={messages.tabs.label}
      width={isDesktop ? 'auto' : 'full'}
      className="lg:self-start"
      value={value}
      options={[
        { value: 'members', label: messages.tabs.members },
        { value: 'roles', label: messages.tabs.roles },
        {
          value: 'invitations',
          label: messages.tabs.invitations,
          badge: pending > 0 ? String(pending) : undefined,
        },
      ]}
      onValueChange={(next) =>
        void navigate({ to: TAB_PATHS[tabOf(next)], params: { workspaceId } })
      }
    />
  )
}

function RolesList({ workspaceId, workspaceName, canEdit }: RolesListProps) {
  const roles = useQuery(rolesQueryOptions(workspaceId))
  if (roles.isError) {
    return (
      <SectionError
        message={messages.rolesFailed}
        errorRef={roles.error instanceof ApiError ? roles.error.ref : null}
        isRetrying={roles.isFetching}
        onRetry={() => void roles.refetch()}
      />
    )
  }
  if (!roles.data) {
    return <SectionSkeleton lines={SKELETON_LINES} />
  }
  return (
    <div className="flex flex-col gap-3 lg:max-w-160">
      <p className="text-body-sm text-ink-muted">{messages.rolesLead(workspaceName)}</p>
      <AccountGroup>
        {roles.data.map((role) => (
          <RoleCard
            key={role.roleId}
            name={role.name}
            description={roleSentence(role)}
            isSystem={role.systemKey !== null}
            isLocked={role.systemKey === OWNER}
            memberCount={role.memberCount}
            invitationCount={role.invitationCount}
            actions={
              (canEdit || role.systemKey === OWNER) && (
                <Button
                  aria-label={messages.openRole(role.name)}
                  variant="quiet"
                  size="icon"
                  render={
                    <Link
                      to="/w/$workspaceId/members/roles/$role"
                      params={{ workspaceId, role: role.roleId }}
                    />
                  }
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              )
            }
          />
        ))}
      </AccountGroup>
    </div>
  )
}

function MembersList({ workspaceId, workspaceName, membershipId, permissions }: MembersListProps) {
  const canRemove = hasPermission(permissions, 'members', 'delete')
  const canChangeRole = hasPermission(permissions, 'members', 'update')
  const members = useQuery(membersQueryOptions(workspaceId))
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  if (members.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={members.error instanceof ApiError ? members.error.ref : null}
        isRetrying={members.isFetching}
        onRetry={() => void members.refetch()}
      />
    )
  }
  if (!members.data) {
    return <SectionSkeleton lines={SKELETON_LINES} />
  }
  const hiddenCount = members.data.length - shownCount
  const isActorOwner = members.data.some(
    (member) => member.membershipId === membershipId && member.role.systemKey === OWNER,
  )
  return (
    <div className="flex flex-col gap-3 lg:max-w-160">
      <AccountGroup title={messages.people(members.data.length)} note={messages.ownersRule}>
        {members.data.slice(0, shownCount).map((member) => (
          <MemberRow
            key={member.membershipId}
            name={member.displayName}
            email={member.email}
            roleName={member.role.name}
            joinedOn={todayIn(TIME_ZONE, new Date(member.joinedAt))}
            isYou={member.membershipId === membershipId}
            actions={
              <MemberActions
                workspaceId={workspaceId}
                workspaceName={workspaceName}
                member={member}
                members={members.data}
                isYou={member.membershipId === membershipId}
                canRemove={canRemove}
                canChangeRole={canChangeRole}
                actorPermissions={permissions}
                isActorOwner={isActorOwner}
              />
            }
          />
        ))}
      </AccountGroup>
      {hiddenCount > 0 && (
        <ShowMoreButton
          hiddenCount={hiddenCount}
          onClick={() => setShownCount((count) => count + PAGE_SIZE)}
        />
      )}
    </div>
  )
}

function tabOf(value: string): MembersTab {
  return value === 'roles' || value === 'invitations' ? value : 'members'
}
