import type { EntryTypeWithCategory, IsoDate, Permission } from '@financas/shared'
import type { FieldControlProps } from '@web/components/forms/form-field'
import type { PickerEmpty, PickerItem, PickerSheetProps } from '@web/components/inputs/picker-sheet'
import type {
  fetchAccounts,
  fetchBalances,
  fetchLatestEntries,
  fetchMembers,
} from '@web/features/entries/api/entries.queries'
import type { expenseFormSchema, newEntrySearchSchema } from '@web/features/entries/entries.schemas'
import type { z } from 'zod'

export type NewEntrySearch = z.infer<typeof newEntrySearchSchema>

export type ExpenseFormInput = z.input<typeof expenseFormSchema>

export type ExpenseFormValues = z.output<typeof expenseFormSchema>

export type LedgerAccount = Awaited<ReturnType<typeof fetchAccounts>>[number]

export type AccountBalance = Awaited<ReturnType<typeof fetchBalances>>[number]

export type LatestEntry = Awaited<ReturnType<typeof fetchLatestEntries>>['items'][number]

export type WorkspaceMember = Awaited<ReturnType<typeof fetchMembers>>[number]

export type EntryKind = EntryTypeWithCategory

export type DateChoice = 'today' | 'yesterday' | 'other'

export type NewEntryProps = {
  workspaceId: string
  currentUserId: string
  permissions: readonly Permission[]
  isOpen: boolean
  onClose: () => void
}

export type EntryFormProps = {
  workspaceId: string
  currentUserId: string
  canSeeMembers: boolean
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
}

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

export type MembersFieldProps = {
  workspaceId: string
}

export type FormFooterProps = {
  isOnline: boolean
  problem: string | null
  onCancel: () => void
}

export type AfterSave = 'close' | 'another'
