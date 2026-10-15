import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
import type { EntryDirection } from '@web/components/finance/entry-row'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntryRowContext,
  EntryRowView,
  LedgerAccount,
  ListedEntry,
} from '@web/features/entries/entries.types'

const messages = entriesMessages.list
const MONEY_KINDS: ReadonlySet<string> = new Set(MONEY_ACCOUNT_KINDS)
const CATEGORY_KINDS: ReadonlySet<string> = new Set(['expense_category', 'income_category'])
const CARD_KIND = 'credit_card'
const DIRECTIONS: Readonly<Record<string, EntryDirection>> = {
  expense: 'out',
  card_purchase: 'out',
  income: 'in',
  settlement: 'in',
  refund: 'in',
}
const SYSTEM_ART: Readonly<Record<string, string>> = {
  transfer: 'transfer',
  settlement: 'settlement',
  invoice_payment: 'invoice-paid',
  opening_balance: 'opening-balance',
}
const SYSTEM_LABELS: Readonly<Record<string, string>> = messages.kinds

export function entryRowOf(entry: ListedEntry, context: EntryRowContext): EntryRowView {
  return {
    id: entry.id,
    description: entry.description,
    detail: detailOf(entry, context),
    art: artOf(entry, context),
    amountCents: entry.amountCents,
    direction: DIRECTIONS[entry.entryType] ?? 'neutral',
    installmentCount: entry.installmentCount,
    isShared: entry.postings.some((posting) => posting.contactId !== null),
    columns: {
      category: leadOf(entry, context) ?? SYSTEM_LABELS[entry.entryType] ?? messages.none,
      account: accountsOf(entry, context) ?? messages.none,
      spentBy:
        (entry.spentByUserId && context.memberNames.get(entry.spentByUserId)) || messages.none,
    },
  }
}

function artOf(entry: ListedEntry, context: EntryRowContext): EntryRowView['art'] {
  const systemArt = SYSTEM_ART[entry.entryType]
  if (systemArt) {
    return { name: SYSTEM_LABELS[entry.entryType] ?? entry.description, icon: systemArt }
  }
  const category = categoryOf(entry, context)
  if (!category) {
    return { name: entry.description, icon: null }
  }
  const parent = parentOf(category, context)
  return { name: (parent ?? category).name, icon: category.icon ?? parent?.icon ?? null }
}

function detailOf(entry: ListedEntry, context: EntryRowContext): string {
  const spender =
    entry.spentByUserId && entry.spentByUserId !== context.currentUserId
      ? context.memberNames.get(entry.spentByUserId)
      : undefined
  return [leadOf(entry, context), accountsOf(entry, context), spender && messages.by(spender)]
    .filter((part): part is string => Boolean(part))
    .join(messages.separator)
}

function leadOf(entry: ListedEntry, context: EntryRowContext): string | undefined {
  if (entry.entryType === 'transfer') {
    return undefined
  }
  const category = categoryOf(entry, context)
  if (!category) {
    return SYSTEM_LABELS[entry.entryType]
  }
  const parent = parentOf(category, context)
  return parent ? `${parent.name} › ${category.name}` : category.name
}

function accountsOf(entry: ListedEntry, context: EntryRowContext): string | undefined {
  const nameOf = (accountId: string) => context.accounts.get(accountId)?.name
  const money = entry.postings.filter((posting) => MONEY_KINDS.has(posting.accountKind))
  if (entry.entryType === 'transfer') {
    const from = money.find((posting) => posting.amountCents < 0)
    const to = money.find((posting) => posting.amountCents > 0)
    return from && to
      ? `${nameOf(from.accountId)}${messages.arrow}${nameOf(to.accountId)}`
      : undefined
  }
  if (entry.entryType === 'card_purchase') {
    const card = entry.postings.find((posting) => posting.accountKind === CARD_KIND)
    return card && nameOf(card.accountId)
  }
  const [first] = money
  return first && nameOf(first.accountId)
}

function categoryOf(entry: ListedEntry, context: EntryRowContext): LedgerAccount | undefined {
  const posting = entry.postings.find((candidate) => CATEGORY_KINDS.has(candidate.accountKind))
  return posting && context.accounts.get(posting.accountId)
}

function parentOf(account: LedgerAccount, context: EntryRowContext): LedgerAccount | undefined {
  return account.parentId ? context.accounts.get(account.parentId) : undefined
}
