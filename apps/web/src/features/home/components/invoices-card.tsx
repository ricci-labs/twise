import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import card from '@web/assets/illustrations/card.svg'
import { TextLink } from '@web/components/actions/text-link'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type { InvoicesCardProps } from '@web/features/home/home.types'
import { cn } from '@web/lib/cn'
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
      <ul className="flex flex-col">
        {invoices.map((invoice) => (
          <li
            key={invoice.cardAccountId}
            className="flex gap-2.5 border-t border-border py-2.5 first:border-t-0 first:pt-0"
          >
            <img src={card} alt="" className="size-8 shrink-0 rounded-full bg-sketch-paper" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-title-sm">{nameOf(invoice.cardAccountId)}</span>
              <span className="text-caption font-normal text-ink-muted">
                {messages.dates(formatShortDate(invoice.closingOn), formatShortDate(invoice.dueOn))}
              </span>
              <Amount cents={invoice.forecastCents} size="lg" className="mt-1" />
              <span className="text-caption font-normal text-ink-muted">
                {messages.parts(
                  formatWholeReais(invoice.postedCents),
                  formatWholeReais(invoice.plannedCents),
                )}
              </span>
              <span
                className={cn(
                  'mt-1.5 inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-0.5 text-caption',
                  invoice.frontedCents > 0 ? 'bg-info-soft text-info' : 'bg-sunken text-ink-muted',
                )}
              >
                <TwiseIcon name={invoice.frontedCents > 0 ? 'users' : 'ok'} size="sm" />
                {invoice.frontedCents > 0
                  ? messages.fronted(formatBrl(invoice.frontedCents))
                  : messages.allYours}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
