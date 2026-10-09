import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { EmptyState } from '@web/components/feedback/empty-state'
import { homeMessages } from '@web/features/home/home.messages'
import type { BillRowProps, BillsDueCardProps, OverviewBill } from '@web/features/home/home.types'
import { cn } from '@web/lib/cn'
import { dateBlockOf, formatShortDate, formatWeekday } from '@web/lib/format/calendar'

const messages = homeMessages.billsDue

export function BillsDueCard({ workspaceId, overview, canWrite, className }: BillsDueCardProps) {
  const { billsDue } = overview.metrics
  const planningLink = (
    <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'planning' }} />
  )
  return (
    <Card
      className={className}
      title={messages.title}
      description={
        billsDue.items.length > 0
          ? messages.summary(
              billsDue.count,
              formatBrl(billsDue.totalCents),
              formatShortDate(billsDue.until),
              billsDue.overdueCount,
            )
          : undefined
      }
      footerAction={<TextLink render={planningLink}>{messages.seeAll}</TextLink>}
    >
      {billsDue.items.length === 0 ? (
        <EmptyState>{messages.empty}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {billsDue.items.map((bill) => (
            <BillRow
              key={bill.occurrenceId}
              workspaceId={workspaceId}
              bill={bill}
              canWrite={canWrite}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

function BillRow({ workspaceId, bill, canWrite }: BillRowProps) {
  const isLate = bill.daysFromToday < 0
  const block = dateBlockOf(bill.dueOn)
  return (
    <li className={cn('flex items-center gap-3 rounded-md px-2 py-2', isLate && 'bg-danger-soft')}>
      <span className="flex w-10 shrink-0 flex-col items-center leading-none" aria-hidden="true">
        <span className="font-display text-title">{block.day}</span>
        <span className="text-caption text-ink-muted">{block.month}</span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body font-semibold">{bill.description}</span>
        <span
          className={cn('text-body-sm', isLate ? 'font-semibold text-danger' : 'text-ink-muted')}
        >
          {whenOf(bill)}
        </span>
        {isLate && canWrite && (
          <TextLink className="self-start text-body-sm lg:hidden" render={recordLink(workspaceId)}>
            {messages.record}
          </TextLink>
        )}
      </span>
      <Amount cents={bill.amountCents} />
      {isLate && canWrite && (
        <Button
          variant="outline"
          size="sm"
          className="hidden lg:inline-flex"
          render={recordLink(workspaceId)}
        >
          {messages.record}
        </Button>
      )}
    </li>
  )
}

function recordLink(workspaceId: string) {
  return <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'planning' }} />
}

function whenOf(bill: OverviewBill): string {
  if (bill.daysFromToday < 0) {
    return messages.late(-bill.daysFromToday)
  }
  if (bill.daysFromToday === 0) {
    return messages.today
  }
  return messages.inDays(formatWeekday(bill.dueOn), bill.daysFromToday)
}
