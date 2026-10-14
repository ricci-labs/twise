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
  CategoryNature,
  EntryFormInput,
  LedgerAccount,
} from '@web/features/entries/entries.types'

const messages = entriesMessages.categories
const INCOME_CATEGORY = 'income_category'
const EMPTY_ICONS = { expense_category: 'receipt', income_category: 'coin' } as const

export function CategoryField({ workspaceId, kind }: CategoryFieldProps) {
  const accounts = useQuery(accountsQueryOptions(workspaceId)).data ?? []
  const latestEntries = useQuery(latestEntriesQueryOptions(workspaceId)).data?.items ?? []
  const usable = accounts.filter((account) => account.kind === kind && account.archivedAt === null)
  const categories = byMostUsed(usable, latestEntries)
  const texts = kind === INCOME_CATEGORY ? messages.income : messages

  return (
    <FormField<EntryFormInput> name="categoryId" label={entriesMessages.fields.category} isRequired>
      {(control) => (
        <EntryPicker
          control={control}
          title={entriesMessages.fields.category}
          subtitle={texts.subtitle}
          placeholder={messages.placeholder}
          items={categoryTree(categories)}
          layout="grid"
          searchLabel={messages.search}
          empty={{ icon: EMPTY_ICONS[kind], title: texts.empty.title, text: texts.empty.text }}
        />
      )}
    </FormField>
  )
}

function categoryTree(categories: readonly LedgerAccount[]): PickerItem[] {
  const ids = new Set(categories.map((category) => category.id))
  const isTop = (category: LedgerAccount) => !category.parentId || !ids.has(category.parentId)
  return categories.filter(isTop).map((parent) => {
    const children = categories
      .filter((category) => category.parentId === parent.id)
      .map((child) => ({
        ...natureOf(child),
        value: child.id,
        label: child.name,
        icon: child.icon,
      }))
    return {
      ...natureOf(parent),
      value: parent.id,
      label: parent.name,
      icon: parent.icon,
      children: children.length > 0 ? children : undefined,
    }
  })
}

function natureOf(category: LedgerAccount): CategoryNature {
  if (category.incomeNature !== 'fixed' && category.incomeNature !== 'variable') {
    return {}
  }
  const nature = messages.income.natures[category.incomeNature]
  return { badge: nature.badge, detail: nature.detail }
}
