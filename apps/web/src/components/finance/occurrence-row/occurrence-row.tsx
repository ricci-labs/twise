import { Button } from '@web/components/actions/button'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { DateBlock } from '@web/components/display/date-block'
import { MetaLine } from '@web/components/display/meta-line'
import { occurrenceRowMessages as messages } from '@web/components/finance/occurrence-row/occurrence-row.messages'
import type {
  OccurrenceBadge,
  OccurrenceRowProps,
} from '@web/components/finance/occurrence-row/occurrence-row.types'
import {
  occurrenceAmountVariants,
  occurrenceDetailVariants,
  occurrenceEstimateVariants,
  occurrenceQuickVariants,
  occurrenceRowMainVariants,
  occurrenceRowVariants,
  occurrenceTextVariants,
  occurrenceTitleVariants,
} from '@web/components/finance/occurrence-row/occurrence-row.variants'
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
      <DateBlock date={dueOn} tone={isOverdue ? 'overdue' : 'default'} />
      <span className={occurrenceTextVariants()}>
        <span className={occurrenceTitleVariants()}>{description}</span>
        <span className={occurrenceDetailVariants()}>
          {badge && (
            <Badge tone={BADGE_TONES[badge]} size="compact" hasDot>
              {messages.badges[badge]}
            </Badge>
          )}
          <MetaLine text={detail} />
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
