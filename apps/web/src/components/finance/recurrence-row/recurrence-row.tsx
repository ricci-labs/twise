import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { recurrenceRowMessages as messages } from '@web/components/finance/recurrence-row/recurrence-row.messages'
import type { RecurrenceRowProps } from '@web/components/finance/recurrence-row/recurrence-row.types'
import {
  recurrenceAmountVariants,
  recurrenceDetailVariants,
  recurrenceEstimateVariants,
  recurrenceNextVariants,
  recurrenceRowMainVariants,
  recurrenceRowVariants,
  recurrenceTextVariants,
  recurrenceTitleVariants,
} from '@web/components/finance/recurrence-row/recurrence-row.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cloneElement } from 'react'

export function RecurrenceRow({
  description,
  detail,
  next,
  art,
  amountCents,
  direction,
  isEstimate = false,
  link,
}: RecurrenceRowProps) {
  const content = (
    <>
      <CategoryArt name={art.name} icon={art.icon} size="md" />
      <span className={recurrenceTextVariants()}>
        <span className={recurrenceTitleVariants()}>{description}</span>
        <span className={recurrenceDetailVariants()}>{detail}</span>
        {next && (
          <span className={recurrenceNextVariants({ tone: next.tone })}>
            {next.tone === 'overdue' && <TwiseIcon name="alert" tone="danger" size="sm" />}
            {next.label}
          </span>
        )}
      </span>
      <span className={recurrenceAmountVariants({ direction })}>
        {isEstimate && (
          <span title={messages.estimate} className={recurrenceEstimateVariants()}>
            ≈<span className="sr-only">{messages.estimate}</span>
          </span>
        )}
        <Amount cents={amountCents} size="inherit" />
      </span>
    </>
  )
  const className = recurrenceRowMainVariants()
  return (
    <li data-slot="recurrence-row" className={recurrenceRowVariants()}>
      {link ? (
        cloneElement(link, { className }, content)
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  )
}
