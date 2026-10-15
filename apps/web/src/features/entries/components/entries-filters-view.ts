import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
import type { FilterChip } from '@web/components/display/filter-chips'
import type { PickerItem } from '@web/components/inputs/picker-sheet'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntriesFiltersProps,
  EntriesListSearch,
  EntryFilterBarValues,
  EntryFilterNames,
  LedgerAccount,
} from '@web/features/entries/entries.types'

const messages = entriesMessages.list.filters
const typeLabels: Readonly<Record<string, string>> = entriesMessages.newEntry.types
const TYPE_PREFIX = 'types:'
const LISTED_KINDS: ReadonlySet<string> = new Set([...MONEY_ACCOUNT_KINDS, 'credit_card'])
const CATEGORY_KINDS: ReadonlySet<string> = new Set(['expense_category', 'income_category'])

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

export function namesOf(
  accounts: readonly LedgerAccount[],
  memberDirectory: EntriesFiltersProps['memberDirectory'],
): EntryFilterNames {
  return {
    accounts: new Map(accounts.map((account) => [account.id, account])),
    members: new Map(memberDirectory.map((member) => [member.userId, member.displayName])),
  }
}

export function accountItemsOf(accounts: readonly LedgerAccount[]): PickerItem[] {
  return accounts
    .filter((account) => LISTED_KINDS.has(account.kind) && account.archivedAt === null)
    .map((account) => ({ value: account.id, label: account.name, icon: account.icon }))
}

export function categoryItemsOf(accounts: readonly LedgerAccount[]): PickerItem[] {
  const categories = accounts.filter(
    (account) => CATEGORY_KINDS.has(account.kind) && account.archivedAt === null,
  )
  return categories
    .filter((category) => category.parentId === null)
    .flatMap((parent) => [
      { value: parent.id, label: parent.name, icon: parent.icon },
      ...categories
        .filter((child) => child.parentId === parent.id)
        .map((child) => ({
          value: child.id,
          label: child.name,
          detail: messages.subcategoryOf(parent.name),
          icon: child.icon ?? parent.icon,
        })),
    ])
}

export function filterBarValuesOf(
  search: EntriesListSearch,
  names: EntryFilterNames,
): EntryFilterBarValues {
  const spentBy = [
    search.spentBy && names.members.get(search.spentBy),
    search.shared && messages.sharedChip,
  ].filter((part): part is string => Boolean(part))
  return {
    types: typesValueOf(search.types ?? []),
    accountId: search.accountId && names.accounts.get(search.accountId)?.name,
    categoryId: search.categoryId && categoryChipOf(search.categoryId, names),
    spentBy: spentBy.length > 0 ? spentBy.join(' · ') : undefined,
  }
}

function typesValueOf(types: readonly string[]): string | undefined {
  const [only] = types
  if (types.length > 1) {
    return messages.typesCount(types.length)
  }
  return only && (typeLabels[only] ?? only)
}
