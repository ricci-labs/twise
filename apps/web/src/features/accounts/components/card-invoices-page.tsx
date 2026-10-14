import { addMonths, invoiceOpeningOn, parseIsoDate, toYearMonthLabel } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { type InvoiceMonth, InvoiceMonthStrip } from '@web/components/finance/invoice-month-strip'
import { InvoiceSummary, type InvoiceSummaryNote } from '@web/components/finance/invoice-summary'
import { PageFrame } from '@web/components/layout/page-frame'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CardInvoice,
  CardInvoicesLoadedProps,
  CardInvoicesPageProps,
  CardSummary,
  InvoiceLineItem,
  LedgerAccount,
} from '@web/features/accounts/accounts.types'
import {
  accountsQueryOptions,
  cardsQueryOptions,
  invoicesQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import {
  cardInvoicesOf,
  chosenInvoiceOf,
  paidNoteOf,
  splitLabelOf,
  stateLabelOf,
  stateToneOf,
  todayOnDevice,
} from '@web/features/accounts/components/card-invoices'
import { CardInvoicesDesktop } from '@web/features/accounts/components/card-invoices-desktop'
import { CardMissing } from '@web/features/accounts/components/card-missing'
import { CardPageFrame } from '@web/features/accounts/components/card-page-frame'
import { CardPageHeader } from '@web/features/accounts/components/card-page-header'
import { InvoiceLinesPreview } from '@web/features/accounts/components/invoice-lines-preview'
import { InvoiceYearPicker } from '@web/features/accounts/components/invoice-year-picker'
import { PayInvoiceButton } from '@web/features/accounts/components/pay-invoice-button'
import { useInvoiceLines } from '@web/features/accounts/hooks/use-invoice-lines'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { formatMonthName, formatShortDate, formatShortMonthName } from '@web/lib/format/calendar'
import { type MouseEvent, useState } from 'react'

const messages = accountsMessages.invoicesPage

const CARD_NOT_FOUND = 'CARD_NOT_FOUND'

const JANUARY = 1

const NO_LINES: never[] = []

export function CardInvoicesPage({
  workspaceId,
  permissions,
  cardId,
  month,
}: CardInvoicesPageProps) {
  const cards = useQuery(cardsQueryOptions(workspaceId))
  const invoices = useQuery(invoicesQueryOptions(workspaceId, cardId))
  const card = cards.data?.find((candidate) => candidate.accountId === cardId)
  usePageTitle(card?.name ?? accountsMessages.cardsPage.pageTitle)
  const isMissing =
    (cards.data !== undefined && !card) ||
    (invoices.error instanceof ApiError && invoices.error.code === CARD_NOT_FOUND)
  const failed = [cards, invoices].find((query) => query.isError)

  if (isMissing) {
    return (
      <CardPageFrame>
        <CardMissing
          title={messages.cardNotFound}
          backLabel={messages.back}
          back={<Link to="/w/$workspaceId/cards" params={{ workspaceId }} />}
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
  if (!card || !invoices.data) {
    return (
      <CardPageFrame>
        <SectionSkeleton lines={4} />
      </CardPageFrame>
    )
  }
  return (
    <CardInvoicesLoaded
      workspaceId={workspaceId}
      permissions={permissions}
      card={card}
      stored={invoices.data}
      month={month}
    />
  )
}

function CardInvoicesLoaded({
  workspaceId,
  permissions,
  card,
  stored,
  month,
}: CardInvoicesLoadedProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [isYearOpen, setIsYearOpen] = useState(false)
  const [yearAnchor, setYearAnchor] = useState<Element | null>(null)
  const openYear = (event: MouseEvent<HTMLButtonElement>) => {
    setYearAnchor(event.currentTarget)
    setIsYearOpen(true)
  }
  const invoices = cardInvoicesOf(card, stored, todayOnDevice())
  const chosen = chosenInvoiceOf(invoices, card, month) ?? invoices.at(-1)
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const lines = useInvoiceLines(workspaceId, card.accountId, chosen?.invoiceId ?? null, 'all')
  if (!chosen) {
    return null
  }
  const months = monthsOf(workspaceId, card, invoices, chosen)
  const yearPicker = (
    <InvoiceYearPicker
      workspaceId={workspaceId}
      card={card}
      invoices={invoices}
      chosen={chosen}
      anchor={yearAnchor}
      isOpen={isYearOpen}
      onOpenChange={setIsYearOpen}
    />
  )
  if (isDesktop) {
    return (
      <>
        <CardInvoicesDesktop
          workspaceId={workspaceId}
          permissions={permissions}
          card={card}
          invoice={chosen}
          months={months}
          onAll={openYear}
        />
        {yearPicker}
      </>
    )
  }
  return (
    <PageFrame edge="bleed" className="gap-4">
      <div className="flex flex-col gap-3.5">
        <CardPageHeader
          workspaceId={workspaceId}
          permissions={permissions}
          card={card}
          back={<Link to="/w/$workspaceId/cards" params={{ workspaceId }} />}
          backLabel={messages.back}
          title={card.name}
          description={accountsMessages.cardsPage.cycle(card.closingDay, card.dueDay)}
        />
        <InvoiceMonthStrip
          label={messages.strip(card.name)}
          anchor={card.currentInvoice.referenceMonth}
          allLabel={messages.all}
          onAll={openYear}
          months={months}
        />
      </div>
      <div className="flex flex-col gap-4 px-4">
        <InvoiceSummary
          title={messages.title(formatMonthName(chosen.referenceMonth))}
          status={{ label: stateLabelOf(chosen.state), tone: stateToneOf(chosen.state) }}
          dates={messages.dates(formatShortDate(chosen.closingOn), formatShortDate(chosen.dueOn))}
          totalCents={chosen.totalCents}
          paid={{ label: messages.parts.paid, cents: chosen.paidCents }}
          due={{ label: messages.parts.due, cents: chosen.dueCents }}
          own={{ label: messages.parts.own, cents: chosen.ownCents }}
          fronted={{ label: messages.parts.fronted, cents: chosen.frontedCents }}
          splitLabel={splitLabelOf(chosen)}
          note={noteOf(chosen, card, lines.lastPayment, accounts.data)}
          action={
            <PayInvoiceButton permissions={permissions} card={card} invoice={chosen} width="full" />
          }
        />
        <InvoiceLinesPreview
          workspaceId={workspaceId}
          card={card}
          invoice={chosen}
          lines={chosen.invoiceId ? lines.lines : NO_LINES}
          counts={lines.counts}
        />
      </div>
      {yearPicker}
    </PageFrame>
  )
}

function monthsOf(
  workspaceId: string,
  card: CardSummary,
  invoices: readonly CardInvoice[],
  chosen: CardInvoice,
): InvoiceMonth[] {
  return invoices.map((invoice, position) => ({
    key: invoice.referenceMonth,
    month: formatShortMonthName(invoice.referenceMonth),
    status: stateLabelOf(invoice.state),
    accessibleLabel: messages.month(
      formatShortMonthName(invoice.referenceMonth),
      yearOf(invoice.referenceMonth),
      stateLabelOf(invoice.state),
    ),
    yearBefore: startsYear(invoice, position) ? String(yearOf(invoice.referenceMonth)) : undefined,
    isCurrent: invoice.referenceMonth === chosen.referenceMonth,
    link: (
      <Link
        to="/w/$workspaceId/cards/$card"
        params={{ workspaceId, card: card.accountId }}
        search={{ month: invoice.referenceMonth }}
        replace
      />
    ),
  }))
}

function noteOf(
  invoice: CardInvoice,
  card: CardSummary,
  lastPayment: InvoiceLineItem | null,
  accounts: readonly LedgerAccount[] | undefined,
): InvoiceSummaryNote | undefined {
  if (invoice.state === 'future') {
    const previous = previousMonthOf(invoice.referenceMonth)
    const opening = formatShortDate(invoiceOpeningOn(invoice, card))
    return {
      icon: 'info',
      tone: 'muted',
      text: messages.futureNote(opening, formatMonthName(previous)),
    }
  }
  const paidNote = invoice.state === 'paid' ? paidNoteOf(lastPayment, accounts) : undefined
  return paidNote ? { icon: 'ok', tone: 'success', text: paidNote } : undefined
}

function previousMonthOf(referenceMonth: string): string {
  const { year, month } = parseIsoDate(`${referenceMonth}-01`)
  return toYearMonthLabel(addMonths({ year, month }, -1))
}

function yearOf(referenceMonth: string): number {
  return parseIsoDate(`${referenceMonth}-01`).year
}

function startsYear(invoice: CardInvoice, position: number): boolean {
  return position > 0 && parseIsoDate(`${invoice.referenceMonth}-01`).month === JANUARY
}
