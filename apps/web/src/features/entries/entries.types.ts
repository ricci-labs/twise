import type {
  EntryInput,
  EntryTypeWithCategory,
  IsoDate,
  Period,
  PeriodsOfYear,
  Permission,
  PlannedInstallment,
} from '@financas/shared'
import type { UseInfiniteQueryResult } from '@tanstack/react-query'
import type { EntryHeaderProps } from '@web/components/finance/entry-header'
import type { EntryDirection } from '@web/components/finance/entry-row'
import type { InstallmentRow } from '@web/components/finance/installment-rows'
import type { ShareRow } from '@web/components/finance/share-rows'
import type { TransferEnd } from '@web/components/finance/transfer-flow'
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
  fetchPlannedOccurrence,
  fetchTrashPage,
} from '@web/features/entries/api/entries.queries'
import type {
  entriesListSearchSchema,
  entryDetailsFormSchema,
  entryFormSchema,
  newEntrySearchSchema,
} from '@web/features/entries/entries.schemas'
import type { ReactNode, RefObject } from 'react'
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
  repeatEntryId?: string
  occurrenceId?: string
  onClose: () => void
  onSaved?: (saved: SavedEntry) => void
  onSplitPartSaved?: (position: number) => void
}

export type PlannedOccurrence = Awaited<ReturnType<typeof fetchPlannedOccurrence>>

export type SavedEntry = {
  entryId: string
  description: string
  amountCents: number
  accountId: string
}

export type OccurrenceMatchRequest = {
  occurrenceId: string
  entryId: string
}

export type EntryMatchQuestionProps = {
  workspaceId: string
  saved: SavedEntry
  occurrence?: PlannedOccurrence
  onDone: () => void
}

export type PlannedEntryProps = NewEntryProps & { occurrenceId: string }

export type MatchableOccurrenceView = Pick<
  PlannedOccurrence,
  'id' | 'description' | 'dueOn' | 'amountCents' | 'amountIsEstimate' | 'isOverdue'
>

export type SplitPartPrefill = {
  position: number
  label: string
}

export type SplitPartBandProps = {
  part: SplitPartPrefill
  amountCents: number
}

export type EntryPrefill = {
  values?: EntryFormInput
  entryType?: FormEntryType
  accountId?: string
  toAccountId?: string
  amountCents?: number
  splitPart?: SplitPartPrefill
  cardAccountId?: string
  invoiceId?: string
  planned?: Partial<Pick<EntryFormInput, 'amount' | 'description' | 'categoryId' | 'toAccountId'>>
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
  onSaved?: (saved: SavedEntry) => void
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
  columns: EntryRowColumns
}

export type EntryRowColumns = {
  category: string
  account: string
  spentBy: string
}

export type EntriesTableProps = Pick<
  EntriesListProps,
  'workspaceId' | 'permissions' | 'shown' | 'today'
> & {
  entries: readonly ListedEntry[]
  context: EntryRowContext
  headline: ReactNode
  more: ReactNode
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
  className?: string
}

export type EntriesListProps = EntriesPageProps & {
  shown: ShownRange
  today: IsoDate
}

export type EntriesListEndProps = Pick<EntriesListProps, 'shown' | 'search'> & {
  hasFilters: boolean
}

export type EntriesEmptyProps = EntriesListProps & {
  hasFilters: boolean
}

export type EntriesDaysProps = EntriesListProps & {
  entries: readonly ListedEntry[]
  accounts: readonly LedgerAccount[]
}

export type EntriesShownProps = EntriesDaysProps & {
  headline: ReactNode
  more: ReactNode
}

export type EntriesMoreProps = EntriesListProps & {
  list: Pick<
    UseInfiniteQueryResult,
    'hasNextPage' | 'isFetchNextPageError' | 'isFetchingNextPage' | 'fetchNextPage'
  >
  hasFilters: boolean
}

export type EntriesSearchProps = Pick<EntriesPageProps, 'search' | 'onSearchChange'> & {
  className?: string
}

export type EntriesResultsProps = Pick<EntriesListProps, 'search' | 'onSearchChange' | 'shown'> & {
  count: number
}

export type EntriesHeadlineProps = EntriesListProps & {
  summary: { outCents: number; inCents: number; count: number }
}

export type EntryFilterNames = {
  accounts: ReadonlyMap<string, LedgerAccount>
  members: ReadonlyMap<string, string>
}

export type EntriesFiltersProps = Pick<
  EntriesPageProps,
  'workspaceId' | 'search' | 'onSearchChange' | 'memberDirectory'
> & {
  className?: string
}

export type EntriesFilterBarButtonsProps = EntriesFiltersProps & {
  accounts: readonly LedgerAccount[]
}

export type EntryFilterBarValues = {
  types: string | undefined
  accountId: string | undefined
  categoryId: string | undefined
  spentBy: string | undefined
}

export type FilterMenuProps = {
  label: string
  value: string | undefined
  valueLabel: string | undefined
  items: readonly PickerItem[]
  searchLabel?: string
  onSelect: (value: string | undefined) => void
}

export type EntriesFilterSheetProps = EntriesFiltersProps & {
  accounts: readonly LedgerAccount[]
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type EntryFilterDraft = Pick<
  EntriesListSearch,
  'types' | 'accountId' | 'categoryId' | 'spentBy' | 'shared'
>

export type FilterPickerProps = {
  label: string
  help?: string
  title: string
  placeholder: string
  items: readonly PickerItem[]
  value: string | undefined
  searchLabel: string
  onSelect: (value: string | undefined) => void
}

export type DetailValue =
  | { kind: 'text'; text: string }
  | { kind: 'art'; name: string; icon: string | null }
  | { kind: 'member'; name: string }
  | { kind: 'invoice'; text: string; cardId: string; invoiceId: string }

export type EntryDetailRow = {
  key: string
  label: string
  value: DetailValue
}

export type EntryInstallment = Omit<InstallmentRow, 'link'> & {
  invoiceId: string
}

export type EntryDetailContext = {
  accounts: ReadonlyMap<string, LedgerAccount>
  memberNames: ReadonlyMap<string, string>
  contactNames: ReadonlyMap<string, string>
  invoices: ReadonlyMap<string, CardInvoice>
  card: CardSummary | undefined
  today: IsoDate
}

export type EntryDetailView = {
  header: EntryHeaderProps
  cardId: string | null
  isOnClosedInvoice: boolean
  rows: EntryDetailRow[]
  installments: { start: number; rows: EntryInstallment[] }
  shares: ShareRow[]
  ownCents: number
  transfer?: { from: TransferEnd; to: TransferEnd }
  note?: string
  locked?: EntryLockedSummary
}

export type EntryLockedSummary = {
  title: string
  detail: string
  reason: string
}

export type EntryDetailPageProps = {
  workspaceId: string
  entryId: string
  permissions: readonly Permission[]
  currentUserId: string
  currentUserName: string
  memberDirectory: readonly { userId: string; displayName: string }[]
  isEditing: boolean
  onEditClose: () => void
  onEdited: (entryId: string) => void
  frame?: DetailFrameKind
  onClose?: () => void
}

export type DetailFrameKind = 'page' | 'panel'

export type DetailFrameProps = Pick<EntryDetailPageProps, 'workspaceId' | 'frame' | 'onClose'> & {
  actions?: ReactNode
  children: ReactNode
}

export type DetailEditLinkProps = Pick<EntryDetailPageProps, 'frame'>

export type EntryDetailScreenProps = Omit<EntryDetailPageProps, 'frame' | 'onClose'> & {
  listSearch: EntriesListSearch
  onListSearchChange: (change: Partial<EntriesListSearch>) => void
  onClose: () => void
}

export type EntryDetailBodyProps = EntryDetailPageProps & {
  entry: ListedEntry
}

export type EntryDetailSectionsProps = EntryDetailBodyProps & {
  view: EntryDetailView
}

export type DetailValueViewProps = {
  workspaceId: string
  value: DetailValue
}

export type RepeatedEntryProps = NewEntryProps & {
  repeatEntryId: string
}

export type EntryActionRequest =
  | { action: 'delete'; entryId: string; reason?: string }
  | { action: 'restore'; entryId: string }
  | { action: 'restoreAccount'; accountId: string }

export type EntryDetailActionsProps = Pick<EntryDetailPageProps, 'workspaceId' | 'permissions'> & {
  entry: ListedEntry
  isOnClosedInvoice: boolean
  isInList?: boolean
}

export type DeleteReasonSheetProps = {
  description: string
  isOpen: boolean
  isDeleting: boolean
  onOpenChange: (isOpen: boolean) => void
  onDelete: (reason: string | undefined) => void
}

export type EntryFormFieldsProps = {
  workspaceId: string
  entryType: FormEntryType
  canSeeMembers: boolean
  canSeeContacts: boolean
  canCreateAccounts: boolean
  canCreateCards: boolean
  isNewForm: boolean
  autoFill: AutoFillControls
  amountInput: RefObject<HTMLInputElement | null>
  amountWarning: string | undefined
  plan: CardPlan | undefined
  today: string
  currentUserName: string
  shareTotals: ShareTotals
  onTypeChange: (next: FormEntryType) => void
}

export type EntryChange =
  | { mode: 'details'; entryId: string; description: string; notes: string }
  | { mode: 'replace'; entryId: string; input: EntryInput }

export type EntryDetailsFormValues = z.infer<typeof entryDetailsFormSchema>

export type EntryEditProps = {
  workspaceId: string
  entry: ListedEntry
  locked: EntryLockedSummary | undefined
  currentUserName: string
  permissions: readonly Permission[]
  onClose: () => void
  onSaved: (entryId: string) => void
}

export type LockedEntryEditProps = EntryEditProps & {
  locked: EntryLockedSummary
}

export type VersionNoteProps = {
  changed: readonly string[]
}

export type EditFooterProps = {
  isOnline: boolean
  isBlocked: boolean
  problem: string | null
  onCancel: () => void
}

export type EntryConflictProps = {
  workspaceId: string
}

export type DiscardDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onDiscard: () => void
}

export type TrashedEntry = Awaited<ReturnType<typeof fetchTrashPage>>['items'][number]

export type EntriesTrashPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
  currentUserId: string
  memberDirectory: readonly { userId: string; displayName: string }[]
}

export type EntriesTrashBodyProps = EntriesTrashPageProps & {
  isDesktop: boolean
}

export type EntriesTrashListProps = EntriesTrashPageProps & {
  entries: readonly TrashedEntry[]
  accounts: readonly LedgerAccount[]
}

export type DeletedWords = {
  today: (time: string, name: string) => string
  on: (date: string, name: string) => string
  todayAnonymous: (time: string) => string
  onAnonymous: (date: string) => string
}

export type EntriesTrashRowsProps = {
  rows: readonly TrashedEntryView[]
  busyId: string | null
  onRestore: (entry: TrashedEntry) => void
}

export type TrashedEntryView = {
  entry: TrashedEntry
  row: EntryRowView
  deletedBy: string | undefined
}

export type RestoreRefusal = {
  message: string
  account?: { id: string; name: string }
}
