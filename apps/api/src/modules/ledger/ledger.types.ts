import type { Database } from '@api/core/db/db.types'
import type {
  cardDetails,
  cardInvoices,
  journalEntries,
  ledgerAccounts,
  postings,
} from '@api/modules/ledger/ledger.table'
import type {
  AccountClass,
  AccountKind,
  AccountRef,
  CardCycle,
  ChargeableItem,
  EntryInput,
  EntrySource,
  EntryType,
  EntryTypeWithCategory,
  IncomeNature,
  InvoiceStatus,
  IsoDate,
  PaymentMethod,
} from '@financas/shared'

export type NewLedgerAccount = {
  workspaceId: string
  kind: AccountKind
  name: string
  currency: string
}

export type EntryContext = {
  workspaceId: string
  userId: string
  source: EntrySource
}

export type RecordedEntry = {
  entryId: string
}

export type EntryRef = {
  workspaceId: string
  entryId: string
}

export type EntryChangeRef = EntryRef & {
  userId: string
}

export type DeleteEntryInput = EntryChangeRef & {
  reason?: string
}

export type LedgerContext = {
  workspaceId: string
  userId: string
}

export type WorkspaceAccount = {
  workspaceId: string
  accountId: string
}

export type DeleteAccountInput = WorkspaceAccount & {
  userId: string
  reason?: string
}

export type CreatedAccount = {
  accountId: string
}

export type WorkspaceCard = {
  workspaceId: string
  cardAccountId: string
}

export type AccountBalance = {
  accountId: string
  kind: AccountKind
  class: AccountClass
  balanceCents: number
  naturalBalanceCents: number
}

export type InvoiceTotal = {
  invoiceId: string
  referenceMonth: string
  closingOn: string
  dueOn: string
  status: InvoiceStatus
  totalCents: number
  paidCents: number
  dueCents: number
  frontedCents: number
  ownCents: number
}

export type AccountsById = ReadonlyMap<string, AccountRef>

export type NewEntry = typeof journalEntries.$inferInsert

export type NewPosting = typeof postings.$inferInsert

export type NewAccount = typeof ledgerAccounts.$inferInsert

export type AccountUpdate = Partial<
  Pick<NewAccount, 'name' | 'parentId' | 'ownerUserId' | 'color' | 'icon' | 'sortOrder'>
>

export type NewCardDetails = typeof cardDetails.$inferInsert

export type CardDetailsUpdate = Partial<
  Pick<
    NewCardDetails,
    | 'closingDay'
    | 'dueDay'
    | 'purchaseOnClosingDayGoesNext'
    | 'limitCents'
    | 'holderUserId'
    | 'paymentAccountId'
  >
>

export type NewInvoice = typeof cardInvoices.$inferInsert

export type CardPurchaseInput = Extract<EntryInput, { entryType: 'card_purchase' }>

export type InvoicePaymentInput = Extract<EntryInput, { entryType: 'invoice_payment' }>

export type CardSetup = CardCycle & {
  paymentAccountId: string | null
}

export type LedgerAccountItem = {
  id: string
  parentId: string | null
  kind: AccountKind
  class: AccountClass
  name: string
  currency: string
  incomeNature: IncomeNature | null
  ownerUserId: string | null
  isSystem: boolean
  sortOrder: number
  color: string | null
  icon: string | null
  archivedAt: Date | null
}

export type LedgerRouteDeps = {
  db: Database
}

export type CardItem = {
  accountId: string
  name: string
  color: string | null
  icon: string | null
  sortOrder: number
  archivedAt: Date | null
  createdAt: Date
  closingDay: number
  dueDay: number
  purchaseOnClosingDayGoesNext: boolean
  limitCents: number | null
  holderUserId: string | null
  paymentAccountId: string | null
}

export type InvoiceSnapshot = {
  invoiceId: string | null
  referenceMonth: string
  closingOn: string
  dueOn: string
  status: InvoiceStatus
  totalCents: number
  dueCents: number
}

export type CardSummary = CardItem & {
  openCents: number
  limitUsedPercent: number | null
  currentInvoice: InvoiceSnapshot
}

export type UpcomingInvoice = InvoiceSnapshot & {
  cardAccountId: string
}

export type StoredInvoiceTotal = {
  invoiceId: string
  cardAccountId: string
  referenceMonth: string
  closingOn: string
  dueOn: string
  totalCents: number
  dueCents: number
}

export type AccountsSummary = {
  moneyTotalCents: number
  moneyAccountCount: number
  cardsOpenCents: number
  cardCount: number
  nextInvoice: UpcomingInvoice | null
}

export type PostingItem = {
  lineNo: number
  accountId: string
  accountKind: AccountKind
  amountCents: number
  effectiveOn: string
  invoiceId: string | null
  installmentNo: number | null
  contactId: string | null
}

export type EntryItem = {
  id: string
  entryType: EntryType
  occurredOn: string
  description: string
  notes: string | null
  paymentMethod: PaymentMethod | null
  installmentCount: number
  spentByUserId: string | null
  createdByUserId: string
  source: EntrySource
  replacesEntryId: string | null
  postings: PostingItem[]
}

export type InvoiceLine = {
  entryId: string
  entryType: EntryType
  occurredOn: string
  description: string
  installmentNo: number | null
  installmentCount: number
  amountCents: number
  frontedCents: number
  counterpartAccountId: string | null
}

export type CardInvoiceRef = WorkspaceCard & {
  invoiceId: string
}

export type Deletion = {
  deletedAt: Date
  deletedByUserId: string | null
  deleteReason: string | null
}

export type TrashedAccount = LedgerAccountItem & Deletion

export type TrashedEntry = EntryItem & Deletion

export type EntrySuggestion = {
  description: string
  categoryId: string | null
  accountId: string | null
  paymentMethod: PaymentMethod | null
  lastAmountCents: number
  lastUsedOn: string
}

export type LatestEntryOfDescription = {
  id: string
  description: string
  occurredOn: string
  paymentMethod: PaymentMethod | null
}

export type RecentDescriptionFilter = {
  entryType: EntryTypeWithCategory
  search: string
  limit: number
}

export type FrequentDescriptionFilter = {
  entryType: EntryTypeWithCategory
  createdByUserId: string
  since: IsoDate
  minUses: number
  limit: number
}

export type SuggestionLine = {
  entryId: string
  accountId: string
  accountKind: AccountKind
  amountCents: number
}

export type SuggestionRequester = {
  workspaceId: string
  userId: string
}

export type PostingDetails = Omit<ChargeableItem, 'amountCents'>

export type ContactItems = {
  items: ChargeableItem[]
  paidCents: number
}

export type InvoiceDue = {
  invoiceId: string
  cardName: string
  dueOn: string
  dueCents: number
}

export type EntrySnapshot = typeof journalEntries.$inferSelect & {
  postings: PostingItem[]
}
