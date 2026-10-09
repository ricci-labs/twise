import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { EmptyState } from '@web/components/feedback/empty-state'
import { TwiseIcon } from '@web/components/icons/twise-icon'
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
        <ul className="flex flex-col">
          {billsDue.items.map((bill, position) => (
            <BillRow
              key={bill.occurrenceId}
              workspaceId={workspaceId}
              bill={bill}
              canWrite={canWrite}
              hasDivider={position > 0 && !isLate(bill) && !isLate(billsDue.items[position - 1])}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

function BillRow({ workspaceId, bill, canWrite, hasDivider }: BillRowProps) {
  const late = isLate(bill)
  const block = dateBlockOf(bill.dueOn)
  return (
    <li
      data-late={late ? '' : undefined}
      className={cn(
        'flex items-center gap-3 py-2.5',
        hasDivider && 'border-t border-border',
        late && '-mx-2.5 my-0.5 rounded-md bg-danger-soft px-2.5',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-11.5 w-10.5 shrink-0 flex-col items-center justify-center rounded-md text-caption text-ink-muted uppercase',
          late ? 'bg-surface' : 'bg-sunken',
        )}
      >
        <span className={cn('font-display text-title', late ? 'text-danger' : 'text-ink')}>
          {block.day}
        </span>
        {block.month}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-body font-semibold">{bill.description}</span>
          <Amount cents={bill.amountCents} />
        </span>
        <span className="flex min-h-7.5 items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-body-sm',
              late ? 'font-semibold text-danger' : 'text-ink-muted',
            )}
          >
            {late && <TwiseIcon name="alert" tone="danger" size="sm" />}
            {whenOf(bill)}
          </span>
          {late && canWrite && (
            <Button variant="subtle" size="xs" render={recordLink(workspaceId)}>
              {messages.record}
            </Button>
          )}
        </span>
      </span>
    </li>
  )
}

function isLate(bill: OverviewBill | undefined): boolean {
  return bill !== undefined && bill.daysFromToday < 0
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
