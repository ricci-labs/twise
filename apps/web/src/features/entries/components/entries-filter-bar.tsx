import { useQuery } from '@tanstack/react-query'
import { ActionMenu } from '@web/components/actions/action-menu'
import { TextLink } from '@web/components/actions/text-link'
import { CheckboxMenu } from '@web/components/inputs/checkbox-menu'
import { FilterButton } from '@web/components/inputs/filter-button'
import { PickerSheet } from '@web/components/inputs/picker-sheet'
import { accountsQueryOptions } from '@web/features/entries/api/entries.queries'
import {
  accountItemsOf,
  categoryItemsOf,
  filterBarValuesOf,
  NO_FILTERS,
  namesOf,
} from '@web/features/entries/components/entries-filters-view'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntriesFilterBarButtonsProps,
  EntriesFiltersProps,
  EntryFilterDraft,
  FilterMenuProps,
} from '@web/features/entries/entries.types'
import { cn } from '@web/lib/cn'
import { useMemo, useRef, useState } from 'react'

const messages = entriesMessages.list.filters
const typeLabels: Readonly<Record<string, string>> = entriesMessages.newEntry.types
const TYPE_OPTIONS = Object.entries(typeLabels).map(([value, label]) => ({ value, label }))
const EVERYONE = 'everyone'
const ONLY_SHARED = 'shared'

export function EntriesFilterBar(props: EntriesFiltersProps) {
  const accounts = useQuery(accountsQueryOptions(props.workspaceId))
  if (!accounts.data) {
    return null
  }
  return <FilterBarButtons {...props} accounts={accounts.data} />
}

function FilterBarButtons({
  search,
  onSearchChange,
  memberDirectory,
  accounts,
  className,
}: EntriesFilterBarButtonsProps) {
  const values = filterBarValuesOf(search, namesOf(accounts, memberDirectory))
  const accountItems = useMemo(() => accountItemsOf(accounts), [accounts])
  const categoryItems = useMemo(() => categoryItemsOf(accounts), [accounts])
  const hasFilters = Object.values(values).some((value) => value !== undefined)
  return (
    <fieldset
      aria-label={messages.barLabel}
      className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}
    >
      <CheckboxMenu
        label={messages.types}
        trigger={<FilterButton label={messages.types} value={values.types} />}
        options={TYPE_OPTIONS}
        value={search.types ?? []}
        onChange={(types) =>
          onSearchChange({
            types: types.length > 0 ? (types as EntryFilterDraft['types']) : undefined,
          })
        }
      />
      <FilterMenu
        label={messages.account}
        value={search.accountId}
        valueLabel={values.accountId}
        items={[
          { value: '', label: messages.allAccounts, placeholderIcon: 'list' },
          ...accountItems,
        ]}
        searchLabel={messages.searchAccount}
        onSelect={(accountId) => onSearchChange({ accountId })}
      />
      <FilterMenu
        label={messages.category}
        value={search.categoryId}
        valueLabel={values.categoryId}
        items={[
          { value: '', label: messages.allCategories, placeholderIcon: 'list' },
          ...categoryItems,
        ]}
        searchLabel={messages.searchCategory}
        onSelect={(categoryId) => onSearchChange({ categoryId })}
      />
      <ActionMenu
        trigger={<FilterButton label={messages.spentBy} value={values.spentBy} />}
        groups={[
          [
            { key: EVERYONE, label: messages.everyone, isCurrent: search.spentBy === undefined },
            ...memberDirectory.map((member) => ({
              key: member.userId,
              label: member.displayName,
              isCurrent: search.spentBy === member.userId,
            })),
          ].map((item) => ({
            ...item,
            onSelect: () =>
              onSearchChange({ spentBy: item.key === EVERYONE ? undefined : item.key }),
          })),
          [
            {
              key: ONLY_SHARED,
              label: messages.onlyShared,
              isCurrent: search.shared === true,
              onSelect: () => onSearchChange({ shared: search.shared ? undefined : true }),
            },
          ],
        ]}
      />
      {hasFilters && (
        <TextLink
          render={<button type="button" />}
          className="px-1 text-body-sm"
          onClick={() => onSearchChange(NO_FILTERS)}
        >
          {messages.clearFilters}
        </TextLink>
      )}
    </fieldset>
  )
}

function FilterMenu({ label, value, valueLabel, items, searchLabel, onSelect }: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  return (
    <>
      <FilterButton
        ref={anchor}
        label={label}
        value={valueLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      />
      <PickerSheet
        title={label}
        items={items}
        value={value ?? ''}
        searchLabel={searchLabel}
        anchor={anchor}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(next) => onSelect(next === '' ? undefined : next)}
      />
    </>
  )
}
