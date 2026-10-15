import {
  formatBrl,
  type IsoDate,
  invoiceStateOn,
  MONEY_ACCOUNT_KINDS,
  parseIsoDate,
} from '@financas/shared'
import { entryRowOf } from '@web/features/entries/components/entry-row-view'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  CardInvoice,
  EntryDetailContext,
  EntryDetailRow,
  EntryDetailView,
  EntryInstallment,
  LedgerAccount,
  ListedEntry,
} from '@web/features/entries/entries.types'
import {
  formatMonthTitle,
  formatShortDate,
  formatShortDateWithYear,
  formatWeekdayDayMonthYear,
} from '@web/lib/format/calendar'

const messages = entriesMessages.list.detail
const typeLabels: Readonly<Record<string, string>> = entriesMessages.newEntry.types
const paymentMethods: Readonly<Record<string, string>> = entriesMessages.paymentMethods
const sources: Readonly<Record<string, string>> = messages.sources
const MONEY_KINDS: ReadonlySet<string> = new Set(MONEY_ACCOUNT_KINDS)
const CATEGORY_KINDS: ReadonlySet<string> = new Set(['expense_category', 'income_category'])
const CARD_KIND = 'credit_card'
const STATE_TONES = { future: 'neutral', open: 'warning', closed: 'info', paid: 'success' } as const
const CLOSED_STATES: ReadonlySet<string> = new Set(['closed', 'paid'])
const FIRST_INSTALLMENT = 1

export function entryDetailOf(entry: ListedEntry, context: EntryDetailContext): EntryDetailView {
  const row = entryRowOf(entry, {
    accounts: context.accounts,
    memberNames: context.memberNames,
    currentUserId: '',
  })
  const cardPostings = entry.postings
    .filter((posting) => posting.accountKind === CARD_KIND && posting.invoiceId)
    .sort((a, b) => (a.installmentNo ?? 0) - (b.installmentNo ?? 0))
  const installments = installmentsOf(entry, cardPostings, context)
  return {
    header: {
      art: row.art,
      typeLabel: typeLabels[entry.entryType] ?? entry.entryType,
      description: entry.description,
      amountCents: entry.amountCents,
      direction: row.direction,
      detail: headerDetailOf(entry, cardPostings),
    },
    cardId: cardPostings[0]?.accountId ?? null,
    isOnClosedInvoice: cardPostings.some((posting) => {
      const state = stateOfInvoice(posting.invoiceId, context)
      return state !== undefined && CLOSED_STATES.has(state)
    }),
    rows: rowsOf(entry, cardPostings, context),
    installments: {
      rows: installments,
      start: Math.max(
        installments.findIndex((installment) => !CLOSED_STATES.has(installment.state)) - 1,
        0,
      ),
    },
    shares: entry.shares.map((share) => ({
      key: share.contactId,
      name: context.contactNames.get(share.contactId) ?? '',
      amountCents: share.amountCents,
    })),
    ownCents: entry.ownCents,
    transfer: transferOf(entry, context),
    note: noteOf(entry),
  }
}

function headerDetailOf(entry: ListedEntry, cardPostings: ListedEntry['postings']): string {
  const date = formatWeekdayDayMonthYear(entry.occurredOn as IsoDate)
  if (entry.entryType !== 'card_purchase') {
    return date
  }
  if (entry.installmentCount <= 1) {
    return `${messages.inCash} · ${date}`
  }
  const first = cardPostings.find((posting) => posting.installmentNo === FIRST_INSTALLMENT)
  const each = formatBrl(Math.abs(first?.amountCents ?? 0))
  return `${messages.installments(entry.installmentCount, each)} · ${date}`
}

function rowsOf(
  entry: ListedEntry,
  cardPostings: ListedEntry['postings'],
  context: EntryDetailContext,
): EntryDetailRow[] {
  const money = entry.postings.filter((posting) => MONEY_KINDS.has(posting.accountKind))
  const paidFrom = accountOf(money.find((posting) => posting.amountCents < 0)?.accountId, context)
  const receivedIn = accountOf(money.find((posting) => posting.amountCents > 0)?.accountId, context)
  const category = accountOf(
    entry.postings.find((posting) => CATEGORY_KINDS.has(posting.accountKind))?.accountId,
    context,
  )
  const card = accountOf(cardPostings[0]?.accountId, context)
  const contactId = entry.postings.find((posting) => posting.contactId)?.contactId
  const invoice = cardPostings.length === 1 ? invoiceRowOf(cardPostings[0], context) : undefined
  const byType: Readonly<Record<string, (EntryDetailRow | undefined)[]>> = {
    expense: [
      art('paidFrom', paidFrom),
      categoryRow(category, context),
      payment(entry),
      spender(entry, context),
    ],
    card_purchase: [
      art('card', card),
      invoice && { ...invoice, label: messages.rows.invoice },
      categoryRow(category, context),
      payment(entry),
      spender(entry, context),
    ],
    income: [art('receivedIn', receivedIn), categoryRow(category, context), payment(entry)],
    transfer: [payment(entry)],
    invoice_payment: [
      invoice && { ...invoice, label: messages.rows.paidInvoice },
      art('paidFrom', paidFrom),
    ],
    settlement: [
      contactId ? text('contact', context.contactNames.get(contactId) ?? '') : undefined,
      art('receivedIn', receivedIn),
      payment(entry),
    ],
    opening_balance: [art('account', receivedIn ?? paidFrom)],
  }
  return [...(byType[entry.entryType] ?? []), recordedBy(entry, context)].filter(
    (row): row is EntryDetailRow => row !== undefined,
  )
}

function installmentsOf(
  entry: ListedEntry,
  cardPostings: ListedEntry['postings'],
  context: EntryDetailContext,
): (EntryInstallment & { state: string })[] {
  if (entry.entryType !== 'card_purchase' || entry.installmentCount <= 1) {
    return []
  }
  const year = parseIsoDate(entry.occurredOn as IsoDate).year
  return cardPostings.flatMap((posting) => {
    const invoice = posting.invoiceId ? context.invoices.get(posting.invoiceId) : undefined
    const state = stateOfInvoice(posting.invoiceId, context)
    if (!invoice || !posting.invoiceId || !state) {
      return []
    }
    const dueOn = invoice.dueOn as IsoDate
    return [
      {
        key: posting.invoiceId,
        invoiceId: posting.invoiceId,
        number: `${posting.installmentNo}/${entry.installmentCount}`,
        month: formatMonthTitle(dueOn.slice(0, 7)),
        due: messages.due(
          parseIsoDate(dueOn).year === year
            ? formatShortDate(dueOn)
            : formatShortDateWithYear(dueOn),
        ),
        status: { label: messages.states[state], tone: STATE_TONES[state] },
        amountCents: Math.abs(posting.amountCents),
        state,
      },
    ]
  })
}

function transferOf(entry: ListedEntry, context: EntryDetailContext): EntryDetailView['transfer'] {
  if (entry.entryType !== 'transfer') {
    return undefined
  }
  const money = entry.postings.filter((posting) => MONEY_KINDS.has(posting.accountKind))
  const from = accountOf(money.find((posting) => posting.amountCents < 0)?.accountId, context)
  const to = accountOf(money.find((posting) => posting.amountCents > 0)?.accountId, context)
  return from && to
    ? { from: { name: from.name, icon: from.icon }, to: { name: to.name, icon: to.icon } }
    : undefined
}

function noteOf(entry: ListedEntry): string | undefined {
  if (entry.entryType === 'transfer') {
    return messages.transferNote
  }
  return entry.entryType === 'invoice_payment' ? messages.invoicePaymentNote : undefined
}

function invoiceRowOf(
  posting: ListedEntry['postings'][number] | undefined,
  context: EntryDetailContext,
): EntryDetailRow | undefined {
  const invoice = posting?.invoiceId ? context.invoices.get(posting.invoiceId) : undefined
  if (!posting?.invoiceId || !invoice) {
    return undefined
  }
  const dueOn = invoice.dueOn as IsoDate
  return {
    key: 'invoice',
    label: messages.rows.invoice,
    value: {
      kind: 'invoice',
      text: messages.invoiceLink(
        formatMonthTitle(dueOn.slice(0, 7)).toLocaleLowerCase('pt-BR'),
        formatShortDate(dueOn),
      ),
      cardId: posting.accountId,
      invoiceId: posting.invoiceId,
    },
  }
}

function stateOfInvoice(invoiceId: string | null, context: EntryDetailContext) {
  const invoice: CardInvoice | undefined = invoiceId ? context.invoices.get(invoiceId) : undefined
  return invoice && context.card
    ? invoiceStateOn(
        { ...invoice, closingOn: invoice.closingOn as IsoDate },
        context.today,
        context.card,
      )
    : undefined
}

function accountOf(accountId: string | undefined, context: EntryDetailContext) {
  return accountId ? context.accounts.get(accountId) : undefined
}

function art(
  key: keyof typeof messages.rows,
  account: LedgerAccount | undefined,
): EntryDetailRow | undefined {
  return (
    account && {
      key,
      label: messages.rows[key],
      value: { kind: 'art', name: account.name, icon: account.icon },
    }
  )
}

function categoryRow(category: LedgerAccount | undefined, context: EntryDetailContext) {
  if (!category) {
    return undefined
  }
  const parent = category.parentId ? context.accounts.get(category.parentId) : undefined
  return {
    key: 'category',
    label: messages.rows.category,
    value: {
      kind: 'art' as const,
      name: parent ? `${parent.name} › ${category.name}` : category.name,
      icon: category.icon ?? parent?.icon ?? null,
    },
  }
}

function payment(entry: ListedEntry): EntryDetailRow | undefined {
  const label = entry.paymentMethod ? paymentMethods[entry.paymentMethod] : undefined
  return label ? text('paymentMethod', label) : undefined
}

function spender(entry: ListedEntry, context: EntryDetailContext): EntryDetailRow | undefined {
  const name = entry.spentByUserId ? context.memberNames.get(entry.spentByUserId) : undefined
  return name
    ? { key: 'spentBy', label: messages.rows.spentBy, value: { kind: 'member', name } }
    : undefined
}

function recordedBy(entry: ListedEntry, context: EntryDetailContext): EntryDetailRow {
  const name = context.memberNames.get(entry.createdByUserId) ?? ''
  return text('recordedBy', messages.recordedBy(name, sources[entry.source] ?? ''))
}

function text(key: keyof typeof messages.rows, value: string): EntryDetailRow {
  return { key, label: messages.rows[key], value: { kind: 'text', text: value } }
}
