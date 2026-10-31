import type { NewRole, Permission, SystemRoleKey } from '@financas/shared'
import type { UseQueryResult } from '@tanstack/react-query'
import type {
  fetchInvitations,
  fetchMembers,
  fetchRoles,
} from '@web/features/members/api/members.queries'
import type { useInvite } from '@web/features/members/api/use-invite'
import type { inviteFormSchema, roleFormSchema } from '@web/features/members/members.schemas'
import type { ReactNode } from 'react'
import type { z } from 'zod'

export type Member = Awaited<ReturnType<typeof fetchMembers>>[number]

export type Role = Awaited<ReturnType<typeof fetchRoles>>[number]

export type MembersTab = 'members' | 'roles' | 'invitations'

export type MembersTabsProps = {
  workspaceId: string
  value: MembersTab
  isDesktop: boolean
}

export type HeaderActionProps = {
  tab: MembersTab
  workspaceId: string
  isDesktop: boolean
}

export type RolesListProps = {
  workspaceId: string
  workspaceName: string
  canEdit: boolean
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

export type MemberMenuInput = {
  isYou: boolean
  canChangeRole: boolean
  canSeeHistory: boolean
  canRemove: boolean
  open: Record<'account' | 'leave' | 'role' | 'history' | 'remove', () => void>
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

export type RoleSave = {
  roleId: string | null
  role: NewRole
}

export type RoleEditorPageProps = {
  workspaceId: string
  roleId: string | null
  permissions: readonly Permission[]
}

export type RoleEditorFormProps = {
  workspaceId: string
  role: Role | null
  roles: readonly Role[]
  actorPermissions: readonly Permission[]
}

export type RoleFormInput = z.input<typeof roleFormSchema>

export type RolePreset = Exclude<SystemRoleKey, 'owner'>

export type RoleCardActionsProps = {
  workspaceId: string
  role: Role
  canEdit: boolean
}

export type PresetButtonsProps = {
  roles: readonly Role[]
  onCopy: (preset: RolePreset) => void
}

export type PermissionsFieldProps = {
  actorPermissions: readonly Permission[]
  isLocked: boolean
  layout: 'rows' | 'matrix'
}

export type RoleIdentityFieldsProps = {
  roles: readonly Role[]
  isLocked: boolean
  onCopy: (preset: RolePreset) => void
}

export type RoleEditorDesktopProps = {
  workspaceId: string
  role: Role | null
  problem: string | null
  identity: ReactNode
  permissions: ReactNode
  remove: ReactNode
  save: ReactNode
}

export type RoleUsageCardProps = {
  workspaceId: string
  role: Role
}

export type RoleEditorUnavailableProps = {
  roles: UseQueryResult<Role[]>
}

export type Invitation = Awaited<ReturnType<typeof fetchInvitations>>[number]

export type InvitationsListProps = {
  workspaceId: string
  canRevoke: boolean
}

export type InvitationActionsProps = {
  workspaceId: string
  contact: string
  invitationId: string
}

export type InviteFormInput = z.input<typeof inviteFormSchema>

export type InvitePageProps = {
  workspaceId: string
  workspaceName: string
  membershipId: string
  permissions: readonly Permission[]
}

export type InviteFormProps = InvitePageProps & {
  roles: readonly Role[]
  isActorOwner: boolean
  isDialog: boolean
}

export type InvitedLink = {
  contact: string
  roleName: string
  expiresAt: string
  link: string
  phoneE164: string
}

export type InvitedSheetProps = {
  workspaceName: string
  invited: InvitedLink | null
  onClose: () => void
}

export type InviteFieldsProps = {
  roles: readonly Role[]
  givable: readonly string[]
}

export type CreatedInvite = Awaited<ReturnType<ReturnType<typeof useInvite>['mutateAsync']>>

export type RoleDeleteProps = {
  workspaceId: string
  role: Role
}

export type RoleDeleteDialog = 'confirm' | 'inUse' | null

export type MembersDesktopProps = {
  workspaceId: string
  workspaceName: string
  membershipId: string
  permissions: readonly Permission[]
}

export type MembersCardProps = MembersDesktopProps & {
  members: readonly Member[]
}

export type InvitationsCardProps = {
  workspaceId: string
  members: readonly Member[]
  canRevoke: boolean
}

export type RolesCardProps = {
  workspaceId: string
}

export type PersonCellProps = {
  member: Member
  isYou: boolean
}

export type MembersTabBodyProps = MembersPageProps & {
  isDesktop: boolean
}

export type RolesDesktopProps = {
  workspaceId: string
  canEdit: boolean
}

export type RoleOpenProps = {
  workspaceId: string
  role: Role
  canEdit: boolean
}

export type AbilityMatrixProps = {
  roles: readonly Role[]
}
