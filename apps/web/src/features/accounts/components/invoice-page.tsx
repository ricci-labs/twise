import { formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@web/components/display/badge'
import { Alert } from '@web/components/feedback/alert'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { InvoiceFacts } from '@web/components/finance/invoice-facts'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CardInvoice,
  CardSummary,
  InvoiceDetailProps,
  InvoiceFilter,
  InvoicePageProps,
  StoredInvoice,
} from '@web/features/accounts/accounts.types'
import {
  accountsQueryOptions,
  cardsQueryOptions,
  invoiceLinesQueryOptions,
  invoicesQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import {
  cardInvoicesOf,
  filteredLines,
  invoiceLinesOf,
  isClosedState,
  stateLabelOf,
  stateToneOf,
  todayOnDevice,
} from '@web/features/accounts/components/card-invoices'
import { CardMissing } from '@web/features/accounts/components/card-missing'
import { CardPageFrame } from '@web/features/accounts/components/card-page-frame'
import { CardPageHeader } from '@web/features/accounts/components/card-page-header'
import { InvoiceLineList } from '@web/features/accounts/components/invoice-line-list'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { formatMonthName, formatShortDate } from '@web/lib/format/calendar'
import { useState } from 'react'

const messages = accountsMessages.invoicePage

const invoicesMessages = accountsMessages.invoicesPage

const NOT_FOUND_CODES = new Set(['CARD_NOT_FOUND', 'INVOICE_NOT_FOUND'])

export function InvoicePage({ workspaceId, permissions, cardId, invoiceId }: InvoicePageProps) {
  const cards = useQuery(cardsQueryOptions(workspaceId))
  const stored = useQuery(invoicesQueryOptions(workspaceId, cardId))
  const lines = useQuery(invoiceLinesQueryOptions(workspaceId, cardId, invoiceId))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const card = cards.data?.find((candidate) => candidate.accountId === cardId)
  const invoice = invoiceOf(card, stored.data, invoiceId)
  usePageTitle(titleOf(invoice))
  const queries = [cards, stored, lines, accounts]
  const failed = queries.find((query) => query.isError)
  const isMissing =
    (cards.data !== undefined && !card) ||
    (stored.data !== undefined && card !== undefined && !invoice) ||
    queries.some((query) => isNotFound(query.error))

  if (isMissing) {
    return (
      <CardPageFrame>
        <CardMissing
          title={messages.notFound}
          backLabel={messages.back}
          back={<Link to="/w/$workspaceId/cards/$card" params={{ workspaceId, card: cardId }} />}
        />
      </CardPageFrame>
    )
  }
  if (failed) {
    return (
      <CardPageFrame>
        <SectionError
          message={messages.failed}
          errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
          isRetrying={failed.isFetching}
          onRetry={() => void failed.refetch()}
        />
      </CardPageFrame>
    )
  }
  if (!card || !invoice || !lines.data || !accounts.data) {
    return (
      <CardPageFrame>
        <SectionSkeleton lines={4} />
      </CardPageFrame>
    )
  }
  return (
    <InvoiceDetail
      workspaceId={workspaceId}
      permissions={permissions}
      card={card}
      invoice={invoice}
      lines={invoiceLinesOf(lines.data, accounts.data)}
    />
  )
}

function InvoiceDetail({ workspaceId, permissions, card, invoice, lines }: InvoiceDetailProps) {
  const [filter, setFilter] = useState<InvoiceFilter>('all')
  const shown = filteredLines(lines, filter)
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 pb-6 lg:pt-7 lg:pb-12">
      <CardPageHeader
        workspaceId={workspaceId}
        permissions={permissions}
        card={card}
        back={
          <Link
            to="/w/$workspaceId/cards/$card"
            params={{ workspaceId, card: card.accountId }}
            search={{ month: invoice.referenceMonth }}
          />
        }
        backLabel={messages.back}
        title={invoicesMessages.title(formatMonthName(invoice.referenceMonth))}
        description={messages.description(
          card.name,
          formatShortDate(invoice.closingOn),
          formatShortDate(invoice.dueOn),
        )}
      />
      <div className="flex flex-col gap-4 px-4 lg:px-8">
        {isClosedState(invoice.state) && (
          <Alert tone="info" icon="lock">
            {messages.closed}
          </Alert>
        )}
        <InvoiceFacts label={messages.facts} facts={factsOf(invoice)} />
        <ChoiceChips
          label={messages.filter}
          className="mb-1"
          value={filter}
          onSelect={(value) => setFilter(value as InvoiceFilter)}
          options={[
            { value: 'all', label: messages.filters.all },
            { value: 'own', label: messages.filters.own },
            { value: 'fronted', label: messages.filters.fronted },
          ]}
        />
        {shown.length > 0 ? (
          <InvoiceLineList lines={shown} />
        ) : (
          <p className="rounded-lg border border-border bg-surface px-4 py-5 text-note text-ink-muted">
            {emptyTextOf(filter)}
          </p>
        )}
      </div>
    </div>
  )
}

function invoiceOf(
  card: CardSummary | undefined,
  stored: readonly StoredInvoice[] | undefined,
  invoiceId: string,
): CardInvoice | undefined {
  if (!card || !stored) {
    return undefined
  }
  return cardInvoicesOf(card, stored, todayOnDevice()).find(
    (candidate) => candidate.invoiceId === invoiceId,
  )
}

function titleOf(invoice: CardInvoice | undefined): string {
  return invoice
    ? invoicesMessages.title(formatMonthName(invoice.referenceMonth))
    : accountsMessages.cardsPage.pageTitle
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && NOT_FOUND_CODES.has(error.code)
}

function factsOf(invoice: CardInvoice) {
  const parts = invoicesMessages.parts
  return [
    { label: parts.total, value: formatBrl(invoice.totalCents) },
    { label: parts.paid, value: formatBrl(invoice.paidCents) },
    { label: parts.due, value: formatBrl(invoice.dueCents) },
    { label: parts.own, value: formatBrl(invoice.ownCents) },
    { label: parts.fronted, value: formatBrl(invoice.frontedCents) },
    {
      label: parts.state,
      value: (
        <Badge tone={stateToneOf(invoice.state)} hasDot className="mt-0.5">
          {stateLabelOf(invoice.state)}
        </Badge>
      ),
    },
  ]
}

function emptyTextOf(filter: InvoiceFilter): string {
  if (filter === 'own') {
    return messages.noneOwn
  }
  if (filter === 'fronted') {
    return messages.noneFronted
  }
  return invoicesMessages.noLines
}
