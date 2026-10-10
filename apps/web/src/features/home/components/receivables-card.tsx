import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { RichText } from '@web/components/display/rich-text'
import { homeMessages } from '@web/features/home/home.messages'
import type { ReceivablesCardProps } from '@web/features/home/home.types'
import { formatShortDate } from '@web/lib/format/calendar'
import { CalendarDays } from 'lucide-react'

const messages = homeMessages.receivables

export function ReceivablesCard({
  workspaceId,
  overview,
  nameOf,
  canCharge,
  className,
}: ReceivablesCardProps) {
  const receivables = overview.metrics.receivables
  if (!receivables) {
    return null
  }
  const contacts = <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'contacts' }} />
  return (
    <Card
      className={className}
      title={messages.title}
      description={messages.description}
      footerStat={
        canCharge && (
          <TextLink data-write="" render={contacts}>
            {messages.charge}
          </TextLink>
        )
      }
      footerAction={<TextLink render={contacts}>{messages.seeContacts}</TextLink>}
    >
      <Amount cents={receivables.owedCents} size="kpi" />
      <p className="mt-1 text-body-sm text-ink-muted">
        <span>
          {messages.from(receivables.contactCount)}
          {receivables.overdueCents > 0 && (
            <>
              {' · '}
              <span className="font-semibold text-danger">
                {messages.overdue(formatBrl(receivables.overdueCents))}
              </span>
            </>
          )}
        </span>
      </p>
      {receivables.next && (
        <p className="mt-3.5 flex items-center gap-2 rounded-md bg-sunken px-3 py-2.5 text-body-sm text-ink-muted">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span className="[&_strong]:text-ink">
            <RichText
              text={messages.next}
              values={{
                contact: nameOf(receivables.next.contactId),
                amount: formatBrl(receivables.next.amountCents),
                day: formatShortDate(receivables.next.dueOn),
              }}
            />
          </span>
        </p>
      )}
    </Card>
  )
}
