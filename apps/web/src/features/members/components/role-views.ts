import { membersMessages } from '@web/features/members/members.messages'
import type { Role } from '@web/features/members/members.types'

export function roleSentence(role: Role): string {
  return role.systemKey ? membersMessages.systemRoles[role.systemKey] : (role.description ?? '')
}
