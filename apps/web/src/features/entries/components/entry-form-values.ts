import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
import type { EntryFormInput, ListedEntry } from '@web/features/entries/entries.types'
import { formatTypedAmount } from '@web/lib/format/money'

const MONEY_KINDS: ReadonlySet<string> = new Set(MONEY_ACCOUNT_KINDS)
const CATEGORY_KINDS: ReadonlySet<string> = new Set(['expense_category', 'income_category'])
const CARD_KIND = 'credit_card'
const FIRST = 1
const NONE = ''

export function formInputOf(entry: ListedEntry): EntryFormInput {
  return {
    entryType: entry.entryType as EntryFormInput['entryType'],
    amount: formatTypedAmount(entry.amountCents),
    description: entry.description,
    ...accountsOf(entry),
    ...installmentsOf(entry),
    categoryId: postingOf(entry, (kind) => CATEGORY_KINDS.has(kind))?.accountId ?? NONE,
    occurredOn: entry.occurredOn,
    paymentMethod: entry.paymentMethod ?? NONE,
    spentByUserId: entry.spentByUserId ?? NONE,
    shares: entry.shares.map((share) => ({
      contactId: share.contactId,
      amount: formatTypedAmount(share.amountCents),
    })),
    notes: entry.notes ?? NONE,
  }
}

function accountsOf(entry: ListedEntry) {
  const money = entry.postings.filter((posting) => MONEY_KINDS.has(posting.accountKind))
  const paidFrom = money.find((posting) => posting.amountCents < 0)?.accountId
  const receivedIn = money.find((posting) => posting.amountCents > 0)?.accountId
  const card = postingOf(entry, (kind) => kind === CARD_KIND)
  const accountOfType: Readonly<Record<string, string | undefined>> = {
    expense: paidFrom,
    invoice_payment: paidFrom,
    transfer: paidFrom,
    income: receivedIn,
    settlement: receivedIn,
    opening_balance: receivedIn ?? paidFrom,
  }
  return {
    accountId: accountOfType[entry.entryType] ?? NONE,
    toAccountId: entry.entryType === 'transfer' ? (receivedIn ?? NONE) : NONE,
    cardAccountId: card?.accountId ?? NONE,
    invoiceId: entry.entryType === 'invoice_payment' ? (card?.invoiceId ?? NONE) : NONE,
    contactId:
      entry.entryType === 'settlement'
        ? (entry.postings.find((posting) => posting.contactId)?.contactId ?? NONE)
        : NONE,
    isNegative: entry.entryType === 'opening_balance' && receivedIn === undefined,
  }
}

function installmentsOf(entry: ListedEntry) {
  const numbers = entry.postings
    .filter((posting) => posting.accountKind === CARD_KIND)
    .map((posting) => posting.installmentNo ?? FIRST)
  const firstInstallment = Math.min(...numbers, entry.installmentCount)
  return {
    installmentCount: entry.installmentCount,
    isInProgress: firstInstallment > FIRST,
    firstInstallment,
  }
}

function postingOf(entry: ListedEntry, isKind: (kind: string) => boolean) {
  return entry.postings.find((posting) => isKind(posting.accountKind))
}
