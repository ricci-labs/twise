import {
  addMonths,
  formatBrl,
  type IsoDate,
  invoiceForPurchase,
  invoiceForReferenceMonth,
  invoiceStateOn,
  parseIsoDate,
  todayIn,
  toYearMonthLabel,
} from '@financas/shared'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  CardInvoice,
  CardSummary,
  InvoiceLineItem,
  InvoiceLineView,
  InvoiceState,
  LedgerAccount,
  StoredInvoice,
} from '@web/features/accounts/accounts.types'
import { formatShortDate } from '@web/lib/format/calendar'

const messages = accountsMessages.invoicesPage

const TIME_ZONE = 'America/Sao_Paulo'

const INVOICE_PAYMENT = 'invoice_payment'

const PAYMENT_ICON = 'invoice-paid'

const MAX_MONTHS = 600

export function cardInvoicesOf(
  card: CardSummary,
  stored: readonly StoredInvoice[],
  today: IsoDate,
): CardInvoice[] {
  const byMonth = new Map(stored.map((invoice) => [invoice.referenceMonth, invoice]))
  const months = monthsBetween(firstMonthOf(card, stored), lastMonthOf(card, stored))
  return months.map((referenceMonth) => {
    const found = byMonth.get(referenceMonth)
    return found ? fromStored(found, card, today) : emptyInvoice(referenceMonth, card, today)
  })
}

export function chosenInvoiceOf(
  invoices: readonly CardInvoice[],
  card: CardSummary,
  month: string | undefined,
): CardInvoice | undefined {
  const wanted = month ?? card.currentInvoice.referenceMonth
  return invoices.find((invoice) => invoice.referenceMonth === wanted)
}

export function stateLabelOf(state: InvoiceState): string {
  return messages.states[state]
}

export function stateToneOf(state: InvoiceState) {
  const tones = { future: 'neutral', open: 'warning', closed: 'info', paid: 'success' } as const
  return tones[state]
}

export function isClosedState(state: InvoiceState): boolean {
  return state === 'closed' || state === 'paid'
}

export function invoiceLinesOf(
  lines: readonly InvoiceLineItem[],
  accounts: readonly LedgerAccount[],
): InvoiceLineView[] {
  const byId = new Map(accounts.map((account) => [account.id, account]))
  return lines.map((line, position) => {
    const counterpart = line.counterpartAccountId ? byId.get(line.counterpartAccountId) : undefined
    const isPayment = line.entryType === INVOICE_PAYMENT
    return {
      key: `${line.entryId}-${line.installmentNo ?? 0}-${position}`,
      date: formatShortDate(line.occurredOn),
      description: isPayment ? messages.payment : line.description,
      icon: isPayment ? PAYMENT_ICON : (counterpart?.icon ?? null),
      installment: installmentOf(line),
      detail: detailOf(line, isPayment, counterpart?.name),
      amountCents: line.amountCents,
      frontedCents: line.frontedCents,
      isPayment,
      isFronted: line.frontedCents > 0,
    }
  })
}

export function paidNoteOf(
  payment: InvoiceLineItem | null,
  accounts: readonly LedgerAccount[] | undefined,
): string | undefined {
  if (!payment) {
    return undefined
  }
  const account = accounts?.find((candidate) => candidate.id === payment.counterpartAccountId)
  const date = formatShortDate(payment.occurredOn)
  return account ? messages.paidNote(date, account.name) : messages.paidOn(date)
}

export function splitLabelOf(invoice: CardInvoice): string {
  return messages.split(formatBrl(invoice.ownCents), formatBrl(invoice.frontedCents))
}

export function todayOnDevice(): IsoDate {
  return todayIn(TIME_ZONE, new Date())
}

function fromStored(invoice: StoredInvoice, card: CardSummary, today: IsoDate): CardInvoice {
  return {
    ...invoice,
    state: invoiceStateOn(invoice, today, card),
  }
}

function emptyInvoice(referenceMonth: string, card: CardSummary, today: IsoDate): CardInvoice {
  const invoice = invoiceForReferenceMonth(referenceMonth, card)
  return {
    ...invoice,
    invoiceId: null,
    state: invoiceStateOn({ ...invoice, dueCents: 0, totalCents: 0 }, today, card),
    totalCents: 0,
    paidCents: 0,
    dueCents: 0,
    ownCents: 0,
    frontedCents: 0,
  }
}

function firstMonthOf(card: CardSummary, stored: readonly StoredInvoice[]): string {
  const registered = invoiceForPurchase(todayIn(TIME_ZONE, new Date(card.createdAt)), card)
  const months = [registered.referenceMonth, ...stored.map((invoice) => invoice.referenceMonth)]
  return months.sort()[0] ?? registered.referenceMonth
}

function lastMonthOf(card: CardSummary, stored: readonly StoredInvoice[]): string {
  const months = [card.currentInvoice.referenceMonth, ...stored.map((it) => it.referenceMonth)]
  return months.sort().at(-1) ?? card.currentInvoice.referenceMonth
}

function monthsBetween(first: string, last: string): string[] {
  const { year, month } = parseIsoDate(`${first}-01`)
  const months = [first]
  while (months.at(-1) !== last && months.length <= MAX_MONTHS) {
    months.push(toYearMonthLabel(addMonths({ year, month }, months.length)))
  }
  return months
}

function installmentOf(line: InvoiceLineItem): string | undefined {
  if (line.installmentCount <= 1 || line.installmentNo === null) {
    return undefined
  }
  return messages.installment(line.installmentNo, line.installmentCount)
}

function detailOf(
  line: InvoiceLineItem,
  isPayment: boolean,
  counterpartName: string | undefined,
): string | undefined {
  if (isPayment) {
    return counterpartName ? messages.paidWith(counterpartName) : undefined
  }
  return line.frontedCents > 0 ? messages.fronted(formatBrl(line.frontedCents)) : undefined
}
