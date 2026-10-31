import { Badge } from '@web/components/display/badge'
import { roleCardMessages as messages } from '@web/components/display/role-card/role-card.messages'
import type { RoleCardProps } from '@web/components/display/role-card/role-card.types'
import {
  roleCardActionsVariants,
  roleCardDescriptionVariants,
  roleCardLockVariants,
  roleCardMetaVariants,
  roleCardNameVariants,
  roleCardTextVariants,
  roleCardVariants,
} from '@web/components/display/role-card/role-card.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'

export function RoleCard({
  name,
  description,
  isSystem,
  isLocked = false,
  memberCount,
  invitationCount,
  actions,
}: RoleCardProps) {
  return (
    <li data-slot="role-card" className={roleCardVariants()}>
      <div className={roleCardTextVariants()}>
        <span className={roleCardNameVariants()}>{name}</span>
        <span className={roleCardMetaVariants()}>
          <Badge tone={isSystem ? 'neutral' : 'partial'} size="status" hasDot>
            {isSystem ? messages.system : messages.custom}
          </Badge>
          <span>{usageOf(memberCount, invitationCount)}</span>
        </span>
        {description && <p className={roleCardDescriptionVariants()}>{description}</p>}
        {isLocked && (
          <span className={roleCardLockVariants()}>
            <TwiseIcon name="lock" size="sm" />
            {messages.locked}
          </span>
        )}
      </div>
      {actions && <div className={roleCardActionsVariants()}>{actions}</div>}
    </li>
  )
}

function usageOf(memberCount: number, invitationCount: number): string {
  const parts = [
    memberCount > 0 ? messages.people(memberCount) : null,
    invitationCount > 0 ? messages.invitations(invitationCount) : null,
  ].filter((part) => part !== null)
  return parts.length === 0 ? messages.nobody : parts.join(' · ')
}
