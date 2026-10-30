import type { Permission } from '@financas/shared'
import type { fetchMembers, fetchRoles } from '@web/features/members/api/members.queries'

export type Member = Awaited<ReturnType<typeof fetchMembers>>[number]

export type Role = Awaited<ReturnType<typeof fetchRoles>>[number]

export type MembersTab = 'members' | 'roles'

export type MembersTabsProps = {
  workspaceId: string
  value: MembersTab
}

export type RolesListProps = {
  workspaceId: string
  workspaceName: string
}

export type MembersPageProps = {
  tab: MembersTab
  workspaceId: string
  workspaceName: string
  membershipId: string
  permissions: readonly Permission[]
}

export type MembersListProps = {
  workspaceId: string
  workspaceName: string
  membershipId: string
  permissions: readonly Permission[]
}

export type MemberRemoval = {
  membershipId: string
  reason?: string
}

export type MemberRoleChange = {
  membershipId: string
  roleId: string
}

export type MemberActionsProps = {
  workspaceId: string
  workspaceName: string
  member: Member
  members: readonly Member[]
  isYou: boolean
  canRemove: boolean
  canChangeRole: boolean
  actorPermissions: readonly Permission[]
  isActorOwner: boolean
}

export type MemberDialog = 'remove' | 'leave' | 'lastOwner' | 'role' | null

export type RoleSheetProps = {
  workspaceId: string
  member: Member
  actorPermissions: readonly Permission[]
  isActorOwner: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}
