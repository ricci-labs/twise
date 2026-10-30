import { Avatar } from '@web/components/display/avatar'
import { Badge } from '@web/components/display/badge'
import { memberRowMessages as messages } from '@web/components/display/member-row/member-row.messages'
import type { MemberRowProps } from '@web/components/display/member-row/member-row.types'
import {
  memberRowActionsVariants,
  memberRowEmailVariants,
  memberRowMetaVariants,
  memberRowNameVariants,
  memberRowTextVariants,
  memberRowTitleVariants,
  memberRowVariants,
} from '@web/components/display/member-row/member-row.variants'
import { formatFullDate } from '@web/lib/format/calendar'

export function MemberRow({
  name,
  email,
  roleName,
  joinedOn,
  isYou = false,
  actions,
}: MemberRowProps) {
  return (
    <li data-slot="member-row" className={memberRowVariants()}>
      <Avatar name={name} size="xl" />
      <div className={memberRowTextVariants()}>
        <span className={memberRowNameVariants()}>
          <span className={memberRowTitleVariants()}>{name}</span>
          {isYou && <Badge size="tiny">{messages.you}</Badge>}
        </span>
        <span className={memberRowEmailVariants()}>{email}</span>
        <span className={memberRowMetaVariants()}>
          <Badge tone="success" size="status" hasDot>
            {roleName}
          </Badge>
          <span>{messages.since(formatFullDate(joinedOn))}</span>
        </span>
      </div>
      {actions && <div className={memberRowActionsVariants()}>{actions}</div>}
    </li>
  )
}
