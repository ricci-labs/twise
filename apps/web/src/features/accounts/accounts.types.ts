import type {
  CardChange,
  InvoiceLineCounts,
  InvoiceLineFilter,
  NewAccountInput,
  NewCardInput,
  Permission,
  InvoiceState as SharedInvoiceState,
} from '@financas/shared'
import type { ItemAction } from '@web/components/actions/item-actions'
import type { InvoiceMonth } from '@web/components/finance/invoice-month-strip'
import type { BackLinkProps } from '@web/components/layout/sub-page-header'
import type {
  accountFormSchema,
  cardFormSchema,
  categoryFormSchema,
} from '@web/features/accounts/accounts.schemas'
import type {
  fetchAccounts,
  fetchAccountsSummary,
  fetchBalances,
  fetchCards,
  fetchInvoiceLines,
  fetchInvoices,
  fetchMembers,
  fetchTrashedAccounts,
  fetchUpcomingInvoices,
} from '@web/features/accounts/api/accounts.queries'
import type { MouseEvent, ReactElement, ReactNode } from 'react'
import type { z } from 'zod'

export type LedgerAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type AccountBalance = Awaited<ReturnType<typeof fetchBalances>>[number]

export type AccountsSummary = Awaited<ReturnType<typeof fetchAccountsSummary>>

export type CardSummary = Awaited<ReturnType<typeof fetchCards>>[number]

export type UpcomingInvoice = Awaited<ReturnType<typeof fetchUpcomingInvoices>>[number]
export type StoredInvoice = Awaited<ReturnType<typeof fetchInvoices>>[number]

export type InvoiceLinesPage = Awaited<ReturnType<typeof fetchInvoiceLines>>

export type InvoiceLineItem = InvoiceLinesPage['items'][number]

export type WorkspaceMember = Awaited<ReturnType<typeof fetchMembers>>[number]

export type AccountAction = 'archive' | 'unarchive' | 'delete' | 'restore'

export type AccountParam = { param: { workspaceId: string; accountId: string } }

export type AccountActionRequest = {
  action: AccountAction
  accountId: string
}

export type AccountsPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
  createdId?: string
  onCreatedSeen: () => void
}

export type PayInvoiceButtonProps = {
  permissions: readonly Permission[]
  card: CardSummary
  invoice: CardInvoice
  width?: 'auto' | 'full'
}

export type CreatedAccountMomentProps = {
  workspaceId: string
  createdId: string | undefined
}

export type AccountsAreaHeaderProps = {
  workspaceId: string
  current: 'accounts' | 'categories'
  canSeeTrash: boolean
  newItem?: { label: string; link: ReactElement }
}

export type AccountsSummaryCardsProps = {
  summary: AccountsSummary
  cardNames: ReadonlyMap<string, string>
}

export type ListedAccount = {
  id: string
  name: string
  icon: string | null
  color: string | null
  detail: string
  kindLabel: string
  ownerLabel: string | null
  amountCents: number
  isCard: boolean
  isMoney: boolean
  isArchived: boolean
}

export type AccountsListsProps = {
  workspaceId: string
  permissions: readonly Permission[]
  accounts: readonly ListedAccount[]
  highlightedId?: string
}

export type AccountRowActionsProps = {
  workspaceId: string
  permissions: readonly Permission[]
  account: ListedAccount
  leadingActions?: readonly ItemAction[]
}

export type AccountsData = {
  accounts: readonly LedgerAccount[]
  balances: readonly AccountBalance[]
  cards: readonly CardSummary[]
  members: readonly WorkspaceMember[] | null
}

export type AccountActionHandlers = {
  edit: NonNullable<ItemAction['render']>
  openingBalance: NonNullable<ItemAction['render']>
  canUpdate: boolean
  canRecord: boolean
  canDelete: boolean
  archive: () => void
  unarchive: () => void
  remove: () => void
}

export type AccountsBodyProps = {
  workspaceId: string
  permissions: readonly Permission[]
  highlightedId?: string
}

export type AccountsLoadedProps = AccountsBodyProps & {
  data: AccountsData
  summary: AccountsSummary
}

export type AccountFormInput = z.input<typeof accountFormSchema>

export type AccountFormValues = z.output<typeof accountFormSchema>

export type AccountFormMode = { kind: 'create' } | { kind: 'edit'; account: LedgerAccount }

export type AccountEditorProps = {
  workspaceId: string
  currentUserId: string
  permissions: readonly Permission[]
  param: string | undefined
  onClose: () => void
  onCreated: (accountId: string) => void
}

export type AccountFormProps = {
  workspaceId: string
  mode: AccountFormMode
  members: readonly WorkspaceMember[] | null
  defaults: AccountFormInput
  onClose: () => void
  onCreated: (accountId: string) => void
}

export type AccountFormFooterProps = {
  isEditing: boolean
  isOnline: boolean
  problem: string | null
  onCancel: () => void
  labels?: { create: string; creating: string }
}

export type SaveAccountRequest =
  | { kind: 'create'; input: NewAccountInput }
  | { kind: 'edit'; accountId: string; change: AccountChangeRequest }

export type AccountChangeRequest = {
  name?: string
  parentId?: string | null
  ownerUserId?: string | null
  icon?: string | null
  color?: string | null
}

export type ChangeAccountProps = AccountEditorProps & {
  accountId: string
}

export type TrashedAccount = Awaited<ReturnType<typeof fetchTrashedAccounts>>[number]

export type TrashPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
}

export type TrashedItem = {
  id: string
  name: string
  icon: string | null
  kindLine: string
  deletedLine: string
  reason: string | null
  parent: TrashedParent | null
  restoredMessage: string
  isListedInAccounts: boolean
}

export type TrashedParent = {
  id: string
  name: string
  isInTrash: boolean
  isCategory: boolean
}

export type TrashListProps = {
  workspaceId: string
  items: readonly TrashedItem[]
}

export type TrashRowProps = {
  item: TrashedItem
  onRestore: () => void
}

export type CategoryKind = 'expense' | 'income'

export type CategoryNode = {
  id: string
  name: string
  icon: string | null
  color: string | null
  kind: CategoryKind
  parentId: string | null
  incomeNature: string | null
  isArchived: boolean
  children: CategoryNode[]
}

export type ArchivedCategory = CategoryNode & {
  detail: string
}

export type CategoryTree = {
  active: CategoryNode[]
  archived: ArchivedCategory[]
  archivedCount: number
}

export type CategoriesPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
  kind: CategoryKind
  createdId?: string
}

export type CategoriesBodyProps = CategoriesPageProps & {
  isDesktop: boolean
}

export type CategoriesLoadedProps = CategoriesBodyProps & {
  accounts: readonly LedgerAccount[]
}

export type CategoriesShownProps = CategoriesLoadedProps & {
  isSearching: boolean
}

export type AddSubcategoryProps = {
  parent: CategoryNode
  text?: string
}

export type CategoryListProps = {
  workspaceId: string
  permissions: readonly Permission[]
  tree: CategoryTree
  kind: CategoryKind
  createdId?: string
  isSearching?: boolean
}

export type CategoryTablesProps = {
  workspaceId: string
  permissions: readonly Permission[]
  accounts: readonly LedgerAccount[]
  createdId?: string
  isSearching?: boolean
}

export type CategoryTableProps = {
  workspaceId: string
  permissions: readonly Permission[]
  tree: CategoryTree
  kind: CategoryKind
  createdId?: string
  isSearching: boolean
}

export type CategoryChipsCellProps = CategoryNodeProps & {
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
  onHiddenCountChange: (count: number) => void
}

export type NatureBadgeProps = {
  node: CategoryNode
}

export type CategoryNodeProps = {
  workspaceId: string
  permissions: readonly Permission[]
  node: CategoryNode
  tree: CategoryTree
}

export type CategoryActionsProps = CategoryNodeProps & {
  trigger?: ItemAction['render']
  description?: string
}

export type CategoryRefusal = {
  title: string
  text: string
  confirmLabel: string
}

export type MoveCategorySheetProps = {
  workspaceId: string
  node: CategoryNode
  tree: CategoryTree
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type CategoryMove = {
  accountId: string
  parentId: string | null
}

export type CategoryFormInput = z.input<typeof categoryFormSchema>

export type CategoryFormValues = z.output<typeof categoryFormSchema>

export type CategoryFormMode = { kind: 'create' } | { kind: 'edit'; node: CategoryNode }

export type CategoryEditorProps = {
  workspaceId: string
  permissions: readonly Permission[]
  param: string | undefined
  parentParam: string | undefined
  kindParam: CategoryKind | undefined
  onClose: () => void
  onCreated: (accountId: string, kind: CategoryKind) => void
}

export type CategoryFormProps = {
  workspaceId: string
  mode: CategoryFormMode
  mains: Readonly<Record<CategoryKind, readonly CategoryNode[]>>
  defaults: CategoryFormInput
  onClose: () => void
  onCreated: (accountId: string, kind: CategoryKind) => void
}

export type ParentFieldProps = {
  kind: CategoryKind
  mains: readonly CategoryNode[]
  help?: string
}

export type ParentSectionProps = {
  mode: CategoryFormMode
  kind: CategoryKind
  mains: Readonly<Record<CategoryKind, readonly CategoryNode[]>>
  name: string
}

export type CardsPageProps = {
  workspaceId: string
  permissions: readonly Permission[]
}

export type CardsBodyProps = CardsPageProps & {
  isDesktop: boolean
}

export type CardListProps = CardsPageProps & {
  cards: readonly CardSummary[]
  members: readonly WorkspaceMember[] | null
  afterCards?: ReactNode
}

export type UpcomingInvoicesProps = {
  workspaceId: string
  permissions: readonly Permission[]
  cards: readonly CardSummary[]
}

export type CardItemProps = CardsPageProps & {
  card: CardSummary
  holder: string | null
}

export type InvoiceState = SharedInvoiceState

export type CardInvoice = {
  invoiceId: string | null
  referenceMonth: string
  closingOn: string
  dueOn: string
  state: InvoiceState
  totalCents: number
  paidCents: number
  dueCents: number
  ownCents: number
  frontedCents: number
}

export type InvoiceLineView = {
  key: string
  date: string
  description: string
  icon: string | null
  installment?: string
  detail?: string
  amountCents: number
  frontedCents: number
  isPayment: boolean
  isFronted: boolean
}

export type InvoiceFilter = InvoiceLineFilter

export type CardInvoicesPageProps = CardsPageProps & {
  cardId: string
  month?: string
}

export type InvoicePageProps = CardsPageProps & {
  cardId: string
  invoiceId: string
}

export type CardInvoicesLoadedProps = CardsPageProps & {
  card: CardSummary
  stored: readonly StoredInvoice[]
  month?: string
}

export type InvoiceLinesTableProps = {
  workspaceId: string
  card: CardSummary
  invoice: CardInvoice
}

export type CardInvoicesDesktopProps = CardsPageProps & {
  card: CardSummary
  invoice: CardInvoice
  months: readonly InvoiceMonth[]
  onAll: (event: MouseEvent<HTMLButtonElement>) => void
}

export type PageMissingProps = {
  title: string
  backLabel: string
  back: ReactElement
}

export type CardPageFrameProps = {
  children: ReactNode
}

export type CardPageHeaderProps = CardsPageProps & {
  card: CardSummary
  back: ReactElement<BackLinkProps>
  backLabel: string
  title: string
  description: string
}

export type InvoiceLinesPreviewProps = {
  workspaceId: string
  card: CardSummary
  invoice: CardInvoice
  lines: readonly InvoiceLineView[] | undefined
  counts: InvoiceLineCounts | undefined
}

export type InvoiceYearPickerProps = {
  workspaceId: string
  card: CardSummary
  invoices: readonly CardInvoice[]
  chosen: CardInvoice
  anchor: Element | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type InvoiceDetailProps = CardsPageProps & {
  card: CardSummary
  invoice: CardInvoice
}

export type InvoiceLinesState = {
  lines: readonly InvoiceLineView[] | undefined
  counts: InvoiceLineCounts | undefined
  lastPayment: InvoiceLineItem | null
  hasMore: boolean
  isLoadingMore: boolean
  loadMore: () => void
  error: Error | null
  isRetrying: boolean
  retry: () => void
}

export type InvoiceLinesBodyProps = {
  filter: InvoiceFilter
  lines: InvoiceLinesState
}

export type InvoiceLineListProps = {
  lines: readonly InvoiceLineView[]
}

export type PreviewBodyProps = {
  hasInvoice: boolean
  lines: readonly InvoiceLineView[] | undefined
}

export type CardFormInput = z.input<typeof cardFormSchema>

export type CardFormValues = z.output<typeof cardFormSchema>

export type CardFormMode = { kind: 'create' } | { kind: 'edit'; card: CardSummary }

export type CardEditorProps = {
  workspaceId: string
  currentUserId: string
  permissions: readonly Permission[]
  param: string | undefined
  onClose: () => void
  onCreated: (cardId: string) => void
}

export type CardFormProps = {
  workspaceId: string
  mode: CardFormMode
  accounts: readonly LedgerAccount[]
  members: readonly WorkspaceMember[] | null
  defaults: CardFormInput
  canRename: boolean
  canChangeCycle: boolean
  onClose: () => void
  onCreated: (cardId: string) => void
}

export type CardDaysProps = {
  isEditing: boolean
}

export type PaymentAccountFieldProps = {
  accounts: readonly LedgerAccount[]
}

export type CardNameChange = {
  name?: string
  color?: string | null
}

export type SaveCardRequest =
  | { kind: 'create'; input: NewCardInput }
  | { kind: 'edit'; cardId: string; rename: CardNameChange | null; cycle: CardChange | null }

export type CardDirtyFields = Partial<Record<keyof CardFormInput, boolean>>

export type ChangeCardProps = CardEditorProps & {
  cardId: string
  canRename: boolean
  canChangeCycle: boolean
}

export type ViewerChipProps = {
  workspaceId: string
  permissions: readonly Permission[]
  node: CategoryNode
}
