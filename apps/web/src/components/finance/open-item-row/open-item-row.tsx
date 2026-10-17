import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { DateBlock } from '@web/components/display/date-block'
import { openItemRowMessages as messages } from '@web/components/finance/open-item-row/open-item-row.messages'
import type { OpenItemRowProps } from '@web/components/finance/open-item-row/open-item-row.types'
import {
  openItemRowAmountVariants,
  openItemRowDetailVariants,
  openItemRowMainVariants,
  openItemRowTextVariants,
  openItemRowTitleVariants,
  openItemRowVariants,
} from '@web/components/finance/open-item-row/open-item-row.variants'
import { formatDayMonthLong, formatShortDate } from '@web/lib/format/calendar'
import { cloneElement } from 'react'

export function OpenItemRow({
  dueOn,
  description,
  detail,
  amountCents,
  isOverdue = false,
  chargedOn = null,
  link,
}: OpenItemRowProps) {
  const content = (
    <>
      <DateBlock date={dueOn} tone={isOverdue ? 'overdue' : 'default'} />
      <span className={openItemRowTextVariants()}>
        <span className="sr-only">{messages.dueOn(formatDayMonthLong(dueOn))}</span>
        <span className={openItemRowTitleVariants()}>{description}</span>
        <span className={openItemRowDetailVariants()}>
          {chargedOn && (
            <Badge tone="warning" size="compact" hasDot>
              {messages.inCharge(formatShortDate(chargedOn))}
            </Badge>
          )}
          {isOverdue && !chargedOn && (
            <Badge tone="danger" size="compact" hasDot>
              {messages.overdue}
            </Badge>
          )}
          {detail}
        </span>
      </span>
      <Amount cents={amountCents} size="inherit" className={openItemRowAmountVariants()} />
    </>
  )
  const className = openItemRowMainVariants()
  return (
    <li data-slot="open-item-row" className={openItemRowVariants()}>
      {link ? (
        cloneElement(link, { className }, content)
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  )
}
