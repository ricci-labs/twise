import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { RichText } from '@web/components/display/rich-text'
import { homeMessages } from '@web/features/home/home.messages'
import type { ReceivablesCardProps } from '@web/features/home/home.types'
import { formatShortDate } from '@web/lib/format/calendar'

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
          <Button variant="outline" size="sm" render={contacts}>
            {messages.charge}
          </Button>
        )
      }
      footerAction={<TextLink render={contacts}>{messages.seeContacts}</TextLink>}
    >
      <p className="flex flex-wrap items-baseline gap-x-2">
        <Amount cents={receivables.owedCents} size="lg" />
        <span className="text-body-sm text-ink-muted">
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
        <p className="mt-2 text-body-sm">
          <RichText
            text={messages.next}
            values={{
              contact: nameOf(receivables.next.contactId),
              amount: formatBrl(receivables.next.amountCents),
              day: formatShortDate(receivables.next.dueOn),
            }}
          />
        </p>
      )}
    </Card>
  )
}
