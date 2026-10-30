import type { NewRole, Permission, SystemRoleKey } from '@financas/shared'
import type { UseQueryResult } from '@tanstack/react-query'
import type { fetchMembers, fetchRoles } from '@web/features/members/api/members.queries'
import type { roleFormSchema } from '@web/features/members/members.schemas'
import type { z } from 'zod'

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
}

export type RoleEditorUnavailableProps = {
  roles: UseQueryResult<Role[]>
}
