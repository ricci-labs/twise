import type { Permission } from '@financas/shared'
import { membersMessages } from '@web/features/members/members.messages'
import type { Role } from '@web/features/members/members.types'
import { hasPermission } from '@web/lib/permissions'

const OWNER = 'owner'

export function roleSentence(role: Role): string {
  return role.systemKey ? membersMessages.systemRoles[role.systemKey] : (role.description ?? '')
}

export function canGive(
  role: Role,
  actorPermissions: readonly Permission[],
  isActorOwner: boolean,
) {
  if (role.systemKey === OWNER) {
    return isActorOwner
  }
  return role.permissions.every((permission) =>
    hasPermission(actorPermissions, permission.module, permission.action),
  )
}
