import type { FilterChip } from '@web/components/display/filter-chips'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntriesListSearch,
  EntryFilterNames,
  LedgerAccount,
} from '@web/features/entries/entries.types'

const messages = entriesMessages.list.filters
const typeLabels: Readonly<Record<string, string>> = entriesMessages.newEntry.types
const TYPE_PREFIX = 'types:'

export function filterChipsOf(search: EntriesListSearch, names: EntryFilterNames): FilterChip[] {
  return [
    ...(search.types ?? []).map((type) => ({
      value: `${TYPE_PREFIX}${type}`,
      label: typeLabels[type] ?? type,
    })),
    ...optionalChip('accountId', search.accountId && names.accounts.get(search.accountId)?.name),
    ...optionalChip('categoryId', search.categoryId && categoryChipOf(search.categoryId, names)),
    ...optionalChip('spentBy', search.spentBy && names.members.get(search.spentBy)),
    ...optionalChip('shared', search.shared && messages.sharedChip),
  ]
}

export function withoutChip(search: EntriesListSearch, chip: string): Partial<EntriesListSearch> {
  if (chip.startsWith(TYPE_PREFIX)) {
    const remaining = (search.types ?? []).filter((type) => `${TYPE_PREFIX}${type}` !== chip)
    return { types: remaining.length > 0 ? remaining : undefined }
  }
  return { [chip]: undefined }
}

export const NO_FILTERS: Partial<EntriesListSearch> = {
  types: undefined,
  accountId: undefined,
  categoryId: undefined,
  spentBy: undefined,
  shared: undefined,
}

function categoryChipOf(categoryId: string, names: EntryFilterNames): string | undefined {
  const category = names.accounts.get(categoryId)
  if (!category) {
    return undefined
  }
  return hasChildren(category, names) ? messages.withChildren(category.name) : category.name
}

function hasChildren(category: LedgerAccount, names: EntryFilterNames): boolean {
  return [...names.accounts.values()].some((account) => account.parentId === category.id)
}

function optionalChip(value: string, label: string | false | undefined): FilterChip[] {
  return label ? [{ value, label }] : []
}
