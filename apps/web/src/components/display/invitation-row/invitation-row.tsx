import { Badge } from '@web/components/display/badge'
import { invitationRowMessages as messages } from '@web/components/display/invitation-row/invitation-row.messages'
import type { InvitationRowProps } from '@web/components/display/invitation-row/invitation-row.types'
import {
  invitationRowActionsVariants,
  invitationRowContactVariants,
  invitationRowDetailVariants,
  invitationRowIconVariants,
  invitationRowMetaVariants,
  invitationRowTextVariants,
  invitationRowVariants,
} from '@web/components/display/invitation-row/invitation-row.variants'
import { formatShortDate } from '@web/lib/format/calendar'
import { Mail, Phone } from 'lucide-react'

export function InvitationRow({
  channel,
  contact,
  roleName,
  isCustomRole,
  expiresOn,
  invitedBy,
  invitedOn,
  actions,
}: InvitationRowProps) {
  const isPhone = channel === 'phone'
  return (
    <li data-slot="invitation-row" className={invitationRowVariants()}>
      <span
        role="img"
        aria-label={isPhone ? messages.byPhone : messages.byEmail}
        className={invitationRowIconVariants()}
      >
        {isPhone ? <Phone aria-hidden="true" /> : <Mail aria-hidden="true" />}
      </span>
      <div className={invitationRowTextVariants()}>
        <span className={invitationRowContactVariants()}>{contact}</span>
        <span className={invitationRowMetaVariants()}>
          <Badge tone={isCustomRole ? 'partial' : 'neutral'} size="status" hasDot>
            {roleName}
          </Badge>
          <span>{messages.validUntil(formatShortDate(expiresOn))}</span>
        </span>
        <span className={invitationRowDetailVariants()}>
          {messages.invitedBy(invitedBy, formatShortDate(invitedOn))}
        </span>
        {isPhone && <span className={invitationRowDetailVariants()}>{messages.linkShownOnce}</span>}
      </div>
      {actions && <div className={invitationRowActionsVariants()}>{actions}</div>}
    </li>
  )
}
