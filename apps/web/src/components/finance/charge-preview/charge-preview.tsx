import { Amount } from '@web/components/display/amount'
import { chargePreviewMessages as messages } from '@web/components/finance/charge-preview/charge-preview.messages'
import type { ChargePreviewProps } from '@web/components/finance/charge-preview/charge-preview.types'
import {
  chargePreviewAmountVariants,
  chargePreviewDescriptionVariants,
  chargePreviewDueVariants,
  chargePreviewHeadingVariants,
  chargePreviewItemTextVariants,
  chargePreviewLeaderVariants,
  chargePreviewListVariants,
  chargePreviewRowVariants,
  chargePreviewVariants,
} from '@web/components/finance/charge-preview/charge-preview.variants'
import { cn } from '@web/lib/cn'
import { formatShortDate } from '@web/lib/format/calendar'
import { useId } from 'react'

export function ChargePreview({ items, totalCents, className }: ChargePreviewProps) {
  const headingId = useId()
  return (
    <div data-slot="charge-preview" className={cn(chargePreviewVariants(), className)}>
      <p id={headingId} className={chargePreviewHeadingVariants()}>
        {messages.heading(items.length)}
      </p>
      <ul aria-labelledby={headingId} className={chargePreviewListVariants()}>
        {items.map((item) => (
          <li key={item.key} className={chargePreviewRowVariants()}>
            <span className={chargePreviewItemTextVariants()}>
              <span className={chargePreviewDescriptionVariants()}>{item.description}</span>
              <span className={chargePreviewDueVariants()}>
                {(item.isOverdue ? messages.overdue : messages.due)(formatShortDate(item.dueOn))}
              </span>
            </span>
            <span aria-hidden="true" className={chargePreviewLeaderVariants()} />
            <Amount
              cents={item.amountCents}
              size="inherit"
              className={chargePreviewAmountVariants()}
            />
          </li>
        ))}
        <li className={chargePreviewRowVariants({ isTotal: true })}>
          <span>{messages.total}</span>
          <span aria-hidden="true" className={chargePreviewLeaderVariants()} />
          <Amount cents={totalCents} size="inherit" className={chargePreviewAmountVariants()} />
        </li>
      </ul>
    </div>
  )
}
