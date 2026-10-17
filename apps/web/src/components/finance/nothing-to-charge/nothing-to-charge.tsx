import { formatBrl } from '@financas/shared'
import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { nothingToChargeMessages as messages } from '@web/components/finance/nothing-to-charge/nothing-to-charge.messages'
import type { NothingToChargeProps } from '@web/components/finance/nothing-to-charge/nothing-to-charge.types'
import {
  nothingToChargeBodyVariants,
  nothingToChargeTextVariants,
  nothingToChargeTitleVariants,
  nothingToChargeVariants,
} from '@web/components/finance/nothing-to-charge/nothing-to-charge.variants'
import { cn } from '@web/lib/cn'
import { formatShortDate } from '@web/lib/format/calendar'

export function NothingToCharge({
  chargedOn,
  next,
  onIncludeNext,
  className,
}: NothingToChargeProps) {
  const why = chargedOn ? messages.inCharge(formatShortDate(chargedOn)) : messages.nothingDue
  return (
    <div
      data-slot="nothing-to-charge"
      role="status"
      className={cn(nothingToChargeVariants(), className)}
    >
      <CategoryArt name={messages.title} icon="calendar" size="lg" />
      <div className={nothingToChargeBodyVariants()}>
        <p className={nothingToChargeTitleVariants()}>{messages.title}</p>
        <p className={nothingToChargeTextVariants({ hasAction: Boolean(next && onIncludeNext) })}>
          {why}
          {next && messages.nextDue(formatShortDate(next.dueOn))}
        </p>
        {next && onIncludeNext && (
          <Button variant="secondary" size="sm" onClick={onIncludeNext}>
            {messages.includeNext(formatShortDate(next.dueOn), formatBrl(next.amountCents))}
          </Button>
        )}
      </div>
    </div>
  )
}
