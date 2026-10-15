import type {
  EntryTypeWithCategory,
  IsoDate,
  Period,
  PeriodsOfYear,
  Permission,
  PlannedInstallment,
} from '@financas/shared'
import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import type { EntryDirection } from '@web/components/finance/entry-row'
import type { FieldControlProps } from '@web/components/forms/form-field'
import type { PickerEmpty, PickerItem, PickerSheetProps } from '@web/components/inputs/picker-sheet'
import type {
  fetchAccounts,
  fetchBalances,
  fetchCardInvoices,
  fetchCards,
  fetchContactBalances,
  fetchContacts,
  fetchEntriesPage,
  fetchEntrySuggestions,
  fetchLatestEntries,
  fetchMembers,
} from '@web/features/entries/api/entries.queries'
import type {
  entriesListSearchSchema,
  entryFormSchema,
  newEntrySearchSchema,
} from '@web/features/entries/entries.schemas'
import type { RefObject } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

export type NewEntrySearch = z.infer<typeof newEntrySearchSchema>

export type EntryFormInput = z.input<typeof entryFormSchema>

export type EntryFormValues = z.output<typeof entryFormSchema>

export type LedgerAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type AccountBalance = Awaited<ReturnType<typeof fetchBalances>>[number]

export type LatestEntry = Awaited<ReturnType<typeof fetchLatestEntries>>['items'][number]

export type CardSummary = Awaited<ReturnType<typeof fetchCards>>[number]

export type CardInvoice = Awaited<ReturnType<typeof fetchCardInvoices>>[number]

export type AmountFieldProps = {
  isOpeningBalance: boolean
  warning: string | undefined
  autoFill: AutoFillControls
  inputRef: RefObject<HTMLInputElement | null>
}

export type InvoiceFieldProps = {
  workspaceId: string
}

export type PaymentAccountFieldProps = {
  workspaceId: string
  canCreateAccounts: boolean
}

export type EntrySuggestion = Awaited<ReturnType<typeof fetchEntrySuggestions>>[number]

export type EntryForm = UseFormReturn<EntryFormInput, unknown, EntryFormValues>

export type AutoFillField = 'categoryId' | 'accountId' | 'cardAccountId' | 'paymentMethod'

export type AutoFillSnapshot = Pick<
  EntryFormInput,
  'amount' | 'description' | 'categoryId' | 'accountId' | 'cardAccountId' | 'paymentMethod'
>

export type AutoFill = {
  place: 'amount' | 'description'
  text: string
  pickedKey: string | null
  snapshot: AutoFillSnapshot
}

export type AutoFillControls = {
  autoFill: AutoFill | null
  fillFromSuggestion: (suggestion: EntrySuggestion) => void
  repeatRecent: (suggestion: EntrySuggestion) => void
  undo: () => void
  forget: () => void
}

export type DescriptionFieldProps = {
  workspaceId: string
  entryType: FormEntryType
  autoFill: AutoFillControls
}

export type RecentRowProps = {
  workspaceId: string
  entryType: FormEntryType
  autoFill: AutoFillControls
}

export type ContactBalance = Awaited<ReturnType<typeof fetchContactBalances>>[number]

export type ContactFieldProps = {
  workspaceId: string
}

export type EntryContact = Awaited<ReturnType<typeof fetchContacts>>[number]

export type EntryShareInput = EntryFormInput['shares'][number]

export type WorkspaceMember = Awaited<ReturnType<typeof fetchMembers>>[number]

export type EntryKind = EntryTypeWithCategory

export type DateChoice = 'today' | 'yesterday' | 'other'

export type NewEntryProps = {
  workspaceId: string
  currentUserId: string
  currentUserName: string
  permissions: readonly Permission[]
  isOpen: boolean
  prefill?: EntryPrefill
  onClose: () => void
}

export type EntryPrefill = {
  entryType?: FormEntryType
  accountId?: string
  cardAccountId?: string
  invoiceId?: string
}

export type EntryFormProps = {
  workspaceId: string
  currentUserId: string
  currentUserName: string
  canSeeMembers: boolean
  canSeeContacts: boolean
  canCreateAccounts: boolean
  canCreateCards: boolean
  today: IsoDate
  prefill?: EntryPrefill
  onClose: () => void
}

export type FieldsProps = {
  workspaceId: string
  canSeeMembers: boolean
  today: IsoDate
}

export type AccountFieldProps = {
  workspaceId: string
  canCreateAccounts: boolean
  name?: 'accountId' | 'toAccountId'
  label: string
  detail?: 'balance' | 'kind'
  note?: AccountNote
}

export type AccountDetailOptions = {
  detail: NonNullable<AccountFieldProps['detail']>
  note: AccountNote | undefined
  balances: readonly AccountBalance[]
}

export type AccountNote = {
  accountId: string
  text: string
}

export type CategoryFieldProps = {
  workspaceId: string
  kind: CategoryKind
}

export type CategoryKind = 'expense_category' | 'income_category'

export type CategoryNature = Pick<PickerItem, 'badge' | 'detail'>

export type CardFieldProps = {
  workspaceId: string
  canCreateCards: boolean
}

export type LeadFieldsProps = {
  entryType: FormEntryType
  workspaceId: string
  canCreateAccounts: boolean
}

export type MoneyFieldsProps = {
  entryType: FormEntryType
  workspaceId: string
  canCreateAccounts: boolean
  canCreateCards: boolean
  plan: CardPlan | undefined
  today: IsoDate
}

export type CardPlan = {
  count: number
  installments: readonly PlannedInstallment[]
  eachCents: number
  isInProgress: boolean
  closedAt: PlannedInstallment | undefined
  firstOpen: number | undefined
}

export type CardPreviewProps = {
  plan: CardPlan
  today: IsoDate
}

export type CardInstallmentsProps = {
  plan: CardPlan | undefined
  today: IsoDate
}

export type TypePillsProps = {
  value: FormEntryType
  canSeeContacts: boolean
  onChange: (entryType: FormEntryType) => void
}

export type FormEntryType = EntryFormInput['entryType']

export type EntryInputFields = (values: EntryFormValues) => Record<string, unknown>

export type ChosenArtProps = {
  item: PickerItem
  label: string
  icon: string | null | undefined
}

export type EntryPickerProps = {
  control: FieldControlProps
  title: string
  subtitle?: string
  placeholder: string
  items: readonly PickerItem[]
  layout?: PickerSheetProps['layout']
  searchLabel?: string
  empty?: PickerEmpty
}

export type DateFieldProps = {
  today: IsoDate
}

export type ShareTotals = {
  totalCents: number | null
  yoursCents: number | null
  isOver: boolean
}

export type QuickFill = (totalCents: number, contactCount: number) => number[]

export type SharesFieldProps = {
  workspaceId: string
  yoursName: string
  totals: ShareTotals
}

export type MembersFieldProps = {
  workspaceId: string
}

export type FormFooterProps = {
  isOnline: boolean
  isBlocked?: boolean
  problem: string | null
  onCancel: () => void
}

export type AfterSave = 'close' | 'another'

export type EntriesListSearch = z.infer<typeof entriesListSearchSchema>

export type ListedEntry = Awaited<ReturnType<typeof fetchEntriesPage>>['items'][number]

export type EntryRowContext = {
  accounts: ReadonlyMap<string, LedgerAccount>
  memberNames: ReadonlyMap<string, string>
  currentUserId: string
}

export type EntryRowView = {
  id: string
  description: string
  detail: string
  art: { name: string; icon: string | null }
  amountCents: number
  direction: EntryDirection
  installmentCount: number
  isShared: boolean
}

export type EntryDay = {
  date: IsoDate
  title: string
  detail?: string
  entries: ListedEntry[]
}

export type ShownRange =
  | { kind: 'period'; period: Period; title: string; detail: string }
  | { kind: 'range'; from: IsoDate; to: IsoDate; title: string; detail?: string }

export type EntriesPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
  currentUserId: string
  memberDirectory: readonly { userId: string; displayName: string }[]
  search: EntriesListSearch
  onSearchChange: (change: Partial<EntriesListSearch>) => void
}

export type EntriesPeriodProps = Pick<
  EntriesPageProps,
  'workspaceId' | 'search' | 'onSearchChange'
> & {
  shown: ShownRange
  periods: PeriodsOfYear
}

export type EntriesListProps = EntriesPageProps & {
  shown: ShownRange
  today: IsoDate
}

export type EntriesListEndProps = Pick<EntriesListProps, 'shown'> & {
  hasFilters: boolean
}

export type EntriesEmptyProps = EntriesListProps & {
  hasFilters: boolean
}

export type EntriesDaysProps = EntriesListProps & {
  entries: readonly ListedEntry[]
  accounts: readonly LedgerAccount[]
}

export type EntriesMoreProps = EntriesListProps & {
  list: Pick<
    UseInfiniteQueryResult,
    'hasNextPage' | 'isFetchNextPageError' | 'isFetchingNextPage' | 'fetchNextPage'
  >
  hasFilters: boolean
}
