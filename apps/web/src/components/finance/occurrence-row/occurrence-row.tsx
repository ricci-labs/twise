import { Button } from '@web/components/actions/button'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { occurrenceRowMessages as messages } from '@web/components/finance/occurrence-row/occurrence-row.messages'
import type {
  OccurrenceBadge,
  OccurrenceRowProps,
} from '@web/components/finance/occurrence-row/occurrence-row.types'
import {
  occurrenceAmountVariants,
  occurrenceDateVariants,
  occurrenceDayVariants,
  occurrenceDetailVariants,
  occurrenceEstimateVariants,
  occurrenceMonthVariants,
  occurrenceQuickVariants,
  occurrenceRowMainVariants,
  occurrenceRowVariants,
  occurrenceTextVariants,
  occurrenceTitleVariants,
} from '@web/components/finance/occurrence-row/occurrence-row.variants'
import { dateBlockOf } from '@web/lib/format/calendar'
import { cloneElement } from 'react'

const BADGE_TONES = {
  overdue: 'danger',
  today: 'warning',
  paid: 'success',
  received: 'success',
  done: 'success',
  skipped: 'neutral',
} as const satisfies Record<OccurrenceBadge, string>

export function OccurrenceRow({
  dueOn,
  description,
  detail,
  badge,
  amountCents,
  direction,
  isEstimate = false,
  isDone = false,
  isOverdue = false,
  link,
  register,
}: OccurrenceRowProps) {
  const block = dateBlockOf(dueOn)
  const amount = (
    <span className={occurrenceAmountVariants({ direction: isDone ? 'done' : direction })}>
      {isEstimate && (
        <span title={messages.estimate} className={occurrenceEstimateVariants()}>
          ≈<span className="sr-only">{messages.estimate}</span>
        </span>
      )}
      <Amount cents={amountCents} size="inherit" />
    </span>
  )
  const content = (
    <>
      <span aria-hidden="true" className={occurrenceDateVariants({ isOverdue })}>
        <span className={occurrenceDayVariants()}>{block.day}</span>
        <span className={occurrenceMonthVariants({ isOverdue })}>{block.month}</span>
      </span>
      <span className={occurrenceTextVariants()}>
        <span className={occurrenceTitleVariants()}>{description}</span>
        <span className={occurrenceDetailVariants()}>
          {badge && (
            <Badge tone={BADGE_TONES[badge]} size="compact" hasDot>
              {messages.badges[badge]}
            </Badge>
          )}
          {detail}
        </span>
      </span>
      {!register && amount}
    </>
  )
  const className = occurrenceRowMainVariants()
  return (
    <li data-slot="occurrence-row" className={occurrenceRowVariants()}>
      {link ? (
        cloneElement(link, { className }, content)
      ) : (
        <div className={className}>{content}</div>
      )}
      {register && (
        <span className={occurrenceQuickVariants()}>
          {amount}
          <Button size="xs" aria-label={register.label} onClick={register.onPress}>
            {messages.register}
          </Button>
        </span>
      )}
    </li>
  )
}
