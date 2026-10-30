import type { Permission } from '@financas/shared'
import type { fetchMembers } from '@web/features/members/api/members.queries'

export type Member = Awaited<ReturnType<typeof fetchMembers>>[number]

export type MembersPageProps = {
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
}

export type MemberDialog = 'remove' | 'leave' | 'lastOwner' | null
