import type {
  EntryTypeWithCategory,
  IsoDate,
  Permission,
  PlannedInstallment,
} from '@financas/shared'
import type { FieldControlProps } from '@web/components/forms/form-field'
import type { PickerEmpty, PickerItem, PickerSheetProps } from '@web/components/inputs/picker-sheet'
import type {
  fetchAccounts,
  fetchBalances,
  fetchCardInvoices,
  fetchCards,
  fetchContacts,
  fetchLatestEntries,
  fetchMembers,
} from '@web/features/entries/api/entries.queries'
import type { entryFormSchema, newEntrySearchSchema } from '@web/features/entries/entries.schemas'
import type { RefObject } from 'react'
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
  isOverpaid: boolean
  inputRef: RefObject<HTMLInputElement | null>
}

export type InvoiceFieldProps = {
  workspaceId: string
}

export type PaymentAccountFieldProps = {
  workspaceId: string
  canCreateAccounts: boolean
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
  onChange: (entryType: FormEntryType) => void
}

export type FormEntryType = EntryFormInput['entryType']

export type EntryInputFields = (values: EntryFormValues) => Record<string, unknown>

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
