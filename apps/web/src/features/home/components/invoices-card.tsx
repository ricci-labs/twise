import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type { InvoicesCardProps } from '@web/features/home/home.types'
import { formatShortDate } from '@web/lib/format/calendar'
import { formatWholeReais } from '@web/lib/format/money'

const messages = homeMessages.invoices

export function InvoicesCard({ workspaceId, overview, nameOf, className }: InvoicesCardProps) {
  const invoices = overview.metrics.nextInvoice
  if (invoices.length === 0) {
    return null
  }
  return (
    <Card
      className={className}
      title={messages.title}
      description={messages.description}
      footerAction={
        <TextLink
          render={<Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'cards' }} />}
        >
          {messages.seeCards}
        </TextLink>
      }
    >
      <ul className="flex flex-col gap-3">
        {invoices.map((invoice) => (
          <li
            key={invoice.cardAccountId}
            className="flex flex-col gap-1.5 rounded-lg border border-border px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sketch-paper">
                <TwiseIcon name="card" size="md" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body font-semibold">
                  {nameOf(invoice.cardAccountId)}
                </span>
                <span className="text-body-sm text-ink-muted">
                  {messages.dates(
                    formatShortDate(invoice.closingOn),
                    formatShortDate(invoice.dueOn),
                  )}
                </span>
              </span>
              <Amount cents={invoice.forecastCents} />
            </div>
            <p className="text-body-sm text-ink-muted">
              {messages.parts(
                formatWholeReais(invoice.postedCents),
                formatWholeReais(invoice.plannedCents),
              )}
            </p>
            <Badge tone={invoice.frontedCents > 0 ? 'info' : 'neutral'} className="self-start">
              {invoice.frontedCents > 0
                ? messages.fronted(formatBrl(invoice.frontedCents))
                : messages.allYours}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}
