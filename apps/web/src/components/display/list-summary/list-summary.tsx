import { Amount } from '@web/components/display/amount'
import { listSummaryMessages as messages } from '@web/components/display/list-summary/list-summary.messages'
import type { ListSummaryProps } from '@web/components/display/list-summary/list-summary.types'
import {
  listSummaryValueVariants,
  listSummaryVariants,
} from '@web/components/display/list-summary/list-summary.variants'
import { cn } from '@web/lib/cn'

export function ListSummary({ outCents, inCents, count, className }: ListSummaryProps) {
  return (
    <p data-slot="list-summary" role="status" className={cn(listSummaryVariants(), className)}>
      {outCents > 0 && (
        <span>
          {messages.out}
          <Amount cents={outCents} size="inherit" className={listSummaryValueVariants()} />
        </span>
      )}
      {inCents > 0 && (
        <span>
          {messages.in}
          <Amount cents={inCents} size="inherit" className={listSummaryValueVariants()} />
        </span>
      )}
      <span>{messages.count(count)}</span>
    </p>
  )
}
