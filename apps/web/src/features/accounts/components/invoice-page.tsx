import { formatBrl } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { Badge } from '@web/components/display/badge'
import { Alert } from '@web/components/feedback/alert'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { InvoiceFacts } from '@web/components/finance/invoice-facts'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { PageFrame } from '@web/components/layout/page-frame'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CardInvoice,
  CardSummary,
  InvoiceDetailProps,
  InvoiceFilter,
  InvoiceLinesBodyProps,
  InvoicePageProps,
  StoredInvoice,
} from '@web/features/accounts/accounts.types'
import {
  cardsQueryOptions,
  invoicesQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import {
  cardInvoicesOf,
  isClosedState,
  stateLabelOf,
  stateToneOf,
  todayOnDevice,
} from '@web/features/accounts/components/card-invoices'
import { CardMissing } from '@web/features/accounts/components/card-missing'
import { CardPageFrame } from '@web/features/accounts/components/card-page-frame'
import { CardPageHeader } from '@web/features/accounts/components/card-page-header'
import { InvoiceLineList } from '@web/features/accounts/components/invoice-line-list'
import { PayInvoiceButton } from '@web/features/accounts/components/pay-invoice-button'
import { useInvoiceLines } from '@web/features/accounts/hooks/use-invoice-lines'
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
  const card = cards.data?.find((candidate) => candidate.accountId === cardId)
  const invoice = invoiceOf(card, stored.data, invoiceId)
  usePageTitle(titleOf(invoice))
  const queries = [cards, stored]
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
  if (!card || !invoice) {
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
    />
  )
}

function InvoiceDetail({ workspaceId, permissions, card, invoice }: InvoiceDetailProps) {
  const [filter, setFilter] = useState<InvoiceFilter>('all')
  const lines = useInvoiceLines(workspaceId, card.accountId, invoice.invoiceId, filter)
  return (
    <PageFrame edge="bleed" className="gap-4">
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
        <PayInvoiceButton permissions={permissions} card={card} invoice={invoice} width="full" />
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
        <InvoiceLinesBody filter={filter} lines={lines} />
      </div>
    </PageFrame>
  )
}

function InvoiceLinesBody({ filter, lines }: InvoiceLinesBodyProps) {
  if (lines.error) {
    return (
      <SectionError
        message={messages.linesFailed}
        errorRef={lines.error instanceof ApiError ? lines.error.ref : null}
        isRetrying={lines.isRetrying}
        onRetry={lines.retry}
      />
    )
  }
  if (!lines.lines) {
    return <ListSkeleton rows={4} />
  }
  if (lines.lines.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface px-4 py-5 text-note text-ink-muted">
        {emptyTextOf(filter)}
      </p>
    )
  }
  return (
    <>
      <InvoiceLineList lines={lines.lines} />
      {lines.hasMore && <ShowMoreButton isLoading={lines.isLoadingMore} onClick={lines.loadMore} />}
    </>
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
