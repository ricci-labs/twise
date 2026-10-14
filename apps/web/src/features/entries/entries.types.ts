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
  fetchCards,
  fetchContacts,
  fetchLatestEntries,
  fetchMembers,
} from '@web/features/entries/api/entries.queries'
import type { entryFormSchema, newEntrySearchSchema } from '@web/features/entries/entries.schemas'
import type { z } from 'zod'

export type NewEntrySearch = z.infer<typeof newEntrySearchSchema>

export type EntryFormInput = z.input<typeof entryFormSchema>

export type EntryFormValues = z.output<typeof entryFormSchema>

export type LedgerAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type AccountBalance = Awaited<ReturnType<typeof fetchBalances>>[number]

export type LatestEntry = Awaited<ReturnType<typeof fetchLatestEntries>>['items'][number]

export type CardSummary = Awaited<ReturnType<typeof fetchCards>>[number]

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
  onClose: () => void
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
}

export type CardFieldProps = {
  workspaceId: string
  canCreateCards: boolean
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

export type EntryTypePillsProps = {
  onChange: (entryType: FormEntryType) => void
}

export type FormEntryType = EntryFormInput['entryType']

export type CategoryFieldProps = {
  workspaceId: string
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
