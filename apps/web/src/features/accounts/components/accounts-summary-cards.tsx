import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card'
import { KpiCarousel } from '@web/components/display/kpi-carousel'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { AccountsSummaryCardsProps } from '@web/features/accounts/accounts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = accountsMessages.summary

export function AccountsSummaryCards({ summary, cardNames }: AccountsSummaryCardsProps) {
  const next = summary.nextInvoice
  return (
    <KpiCarousel columns={3}>
      {[
        <KpiCard
          key="money"
          label={messages.money.label}
          value={<Amount cents={summary.moneyTotalCents} size="kpi" isCentsRaised />}
          badge={<KpiBadge>{messages.money.count(summary.moneyAccountCount)}</KpiBadge>}
          art={<CategoryArt name={messages.money.label} icon="wallet" size="xl" />}
          artAt="top"
        >
          <p className="text-ink-muted">{messages.money.foot}</p>
        </KpiCard>,
        <KpiCard
          key="cards"
          label={messages.cards.label}
          value={<Amount cents={summary.cardsOpenCents} size="kpi" isCentsRaised />}
          badge={<KpiBadge>{messages.cards.count(summary.cardCount)}</KpiBadge>}
          art={<CategoryArt name={messages.cards.label} icon="card" size="xl" />}
          artAt="top"
        >
          <p className="text-ink-muted">{messages.cards.foot}</p>
        </KpiCard>,
        <KpiCard
          key="next"
          label={messages.nextInvoice.label}
          value={<Amount cents={next?.dueCents ?? 0} size="kpi" isCentsRaised />}
          badge={next && <KpiBadge>{cardNames.get(next.cardAccountId)}</KpiBadge>}
          art={<CategoryArt name={messages.nextInvoice.label} icon="calendar" size="xl" />}
          artAt="top"
        >
          <p className="text-ink-muted">
            {next
              ? messages.nextInvoice.foot(
                  formatShortDate(next.dueOn),
                  formatShortDate(next.closingOn),
                )
              : messages.nextInvoice.none}
          </p>
        </KpiCard>,
      ]}
    </KpiCarousel>
  )
}
