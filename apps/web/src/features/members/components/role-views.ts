import {
  type AppModule,
  isValidPermission,
  PERMISSION_ACTIONS,
  type Permission,
} from '@financas/shared'
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

export function abilityText(role: Role, module: AppModule): string {
  const words = membersMessages.matrix
  const valid = PERMISSION_ACTIONS.filter((action) => isValidPermission({ module, action }))
  const held = valid.filter((action) => hasPermission(role.permissions, module, action))
  if (held.length === 0) {
    return words.none
  }
  if (held.length === valid.length && valid.length > 1) {
    return words.all
  }
  const listed = held.map((action) => words.actions[action]).join(', ')
  return listed.charAt(0).toLocaleUpperCase('pt-BR') + listed.slice(1)
}

export function roleUsageText(role: Role): string {
  const usage = membersMessages.desktop.roleUsage
  const parts = [
    role.memberCount > 0 ? usage.people(role.memberCount) : null,
    role.invitationCount > 0 ? usage.invitations(role.invitationCount) : null,
  ].filter((part) => part !== null)
  return parts.length === 0 ? usage.nobody : parts.join(' · ')
}

export function roleTypeText(role: Role): string {
  const usage = membersMessages.desktop.roleUsage
  return role.systemKey === null ? usage.custom : usage.system
}
