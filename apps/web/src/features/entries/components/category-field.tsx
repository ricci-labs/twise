import { useQuery } from '@tanstack/react-query'
import { FormField } from '@web/components/forms/form-field'
import type { PickerItem } from '@web/components/inputs/picker-sheet'
import {
  accountsQueryOptions,
  latestEntriesQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { byMostUsed } from '@web/features/entries/components/category-order'
import { EntryPicker } from '@web/features/entries/components/entry-picker'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  CategoryFieldProps,
  ExpenseFormInput,
  LedgerAccount,
} from '@web/features/entries/entries.types'

const messages = entriesMessages.categories
const EXPENSE_CATEGORY = 'expense_category'

export function CategoryField({ workspaceId }: CategoryFieldProps) {
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data ?? []
  const latestEntries = useQuery(latestEntriesQueryOptions(workspaceId)).data?.items ?? []
  const categories = byMostUsed(accounts.filter(isUsableExpenseCategory), latestEntries)

  return (
    <FormField<ExpenseFormInput>
      name="categoryId"
      label={entriesMessages.fields.category}
      isRequired
    >
      {(control) => (
        <EntryPicker
          control={control}
          title={entriesMessages.fields.category}
          subtitle={messages.subtitle}
          placeholder={messages.placeholder}
          items={categoryTree(categories)}
          layout="grid"
          searchLabel={messages.search}
          empty={{ icon: 'receipt', title: messages.empty.title, text: messages.empty.text }}
        />
      )}
    </FormField>
  )
}

function isUsableExpenseCategory(account: LedgerAccount): boolean {
  return account.kind === EXPENSE_CATEGORY && account.archivedAt === null
}

function categoryTree(categories: readonly LedgerAccount[]): PickerItem[] {
  const ids = new Set(categories.map((category) => category.id))
  const isTop = (category: LedgerAccount) => !category.parentId || !ids.has(category.parentId)
  return categories.filter(isTop).map((parent) => {
    const children = categories
      .filter((category) => category.parentId === parent.id)
      .map((child) => ({ value: child.id, label: child.name, icon: child.icon }))
    return {
      value: parent.id,
      label: parent.name,
      icon: parent.icon,
      children: children.length > 0 ? children : undefined,
    }
  })
}
