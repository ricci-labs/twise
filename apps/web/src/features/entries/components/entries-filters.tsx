import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { CategoryArt } from '@web/components/display/category-art'
import { FilterChips } from '@web/components/display/filter-chips'
import { FieldGroup } from '@web/components/forms/field-group'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { ChoiceChips } from '@web/components/inputs/choice-chips'
import { PickerField } from '@web/components/inputs/picker-field'
import { type PickerItem, PickerSheet } from '@web/components/inputs/picker-sheet'
import { Switch } from '@web/components/inputs/switch'
import { ToggleChips } from '@web/components/inputs/toggle-chips'
import { Sheet } from '@web/components/layout/sheet'
import { accountsQueryOptions } from '@web/features/entries/api/entries.queries'
import {
  filterChipsOf,
  NO_FILTERS,
  withoutChip,
} from '@web/features/entries/components/entries-filters-view'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntriesFilterSheetProps,
  EntriesFiltersProps,
  EntryFilterDraft,
  FilterPickerProps,
  LedgerAccount,
} from '@web/features/entries/entries.types'
import { useMemo, useRef, useState } from 'react'

const messages = entriesMessages.list.filters
const typeLabels: Readonly<Record<string, string>> = entriesMessages.newEntry.types
const TYPE_OPTIONS = Object.entries(typeLabels).map(([value, label]) => ({ value, label }))
const LISTED_KINDS: ReadonlySet<string> = new Set([...MONEY_ACCOUNT_KINDS, 'credit_card'])
const CATEGORY_KINDS: ReadonlySet<string> = new Set(['expense_category', 'income_category'])
const EVERYONE = ''

export function EntriesFilterButton(props: EntriesFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const accounts = useQuery(accountsQueryOptions(props.workspaceId))
  const count = filterChipsOf(props.search, namesOf(accounts.data ?? [], props)).length
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={count > 0 ? messages.buttonWithCount(count) : messages.button}
        data-active={count > 0 ? '' : undefined}
        className="inline-flex min-h-touch shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border-control bg-surface px-3.5 text-label text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring data-active:border-ink data-active:ring-1 data-active:ring-ink data-active:ring-inset"
        onClick={() => setIsOpen(true)}
      >
        <TwiseIcon name="sliders" size="sm" />
        {messages.button}
        {count > 0 && (
          <span
            aria-hidden="true"
            className="grid size-5 place-items-center rounded-full bg-action-primary text-caption font-emphasis text-on-action-primary"
          >
            {count}
          </span>
        )}
      </button>
      {accounts.data && (
        <EntriesFilterSheet
          {...props}
          accounts={accounts.data}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  )
}

export function EntriesFilterChips(props: EntriesFiltersProps) {
  const accounts = useQuery(accountsQueryOptions(props.workspaceId))
  const { search, onSearchChange } = props
  return (
    <FilterChips
      chips={filterChipsOf(search, namesOf(accounts.data ?? [], props))}
      onRemove={(chip) => onSearchChange(withoutChip(search, chip))}
      onClear={() => onSearchChange(NO_FILTERS)}
    />
  )
}

function EntriesFilterSheet({
  search,
  onSearchChange,
  memberDirectory,
  accounts,
  isOpen,
  onOpenChange,
}: EntriesFilterSheetProps) {
  const [draft, setDraft] = useState<EntryFilterDraft>(search)
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setDraft(search)
    }
  }
  const change = (next: Partial<EntryFilterDraft>) => setDraft({ ...draft, ...next })
  const accountItems = useMemo(() => accountItemsOf(accounts), [accounts])
  const categoryItems = useMemo(() => categoryItemsOf(accounts), [accounts])
  return (
    <Sheet
      title={messages.title}
      closeLabel={messages.close}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-5">
        <FieldGroup label={messages.types} help={messages.typesHelp}>
          <ToggleChips
            label={messages.types}
            options={TYPE_OPTIONS}
            value={draft.types ?? []}
            onChange={(types) =>
              change({ types: types.length > 0 ? (types as EntryFilterDraft['types']) : undefined })
            }
          />
        </FieldGroup>
        <FilterPicker
          label={messages.account}
          title={messages.account}
          placeholder={messages.allAccounts}
          items={accountItems}
          value={draft.accountId}
          searchLabel={messages.searchAccount}
          onSelect={(accountId) => change({ accountId })}
        />
        <FilterPicker
          label={messages.category}
          help={messages.categoryHelp}
          title={messages.category}
          placeholder={messages.allCategories}
          items={categoryItems}
          value={draft.categoryId}
          searchLabel={messages.searchCategory}
          onSelect={(categoryId) => change({ categoryId })}
        />
        <FieldGroup label={messages.spentBy}>
          <ChoiceChips
            label={messages.spentBy}
            variant="member"
            value={draft.spentBy ?? EVERYONE}
            options={[
              {
                value: EVERYONE,
                label: messages.everyone,
                avatarName: messages.everyone,
                avatarIcon: 'users',
              },
              ...memberDirectory.map((member) => ({
                value: member.userId,
                label: member.displayName,
                avatarName: member.displayName,
              })),
            ]}
            onSelect={(spentBy) => change({ spentBy: spentBy === EVERYONE ? undefined : spentBy })}
          />
        </FieldGroup>
        <Switch
          label={messages.shared}
          isChecked={draft.shared === true}
          onCheckedChange={(shared) => change({ shared: shared || undefined })}
        />
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <Button variant="tertiary" onClick={() => setDraft(NO_FILTERS)}>
            {messages.clearAll}
          </Button>
          <Button
            onClick={() => {
              onSearchChange({ ...NO_FILTERS, ...draft })
              onOpenChange(false)
            }}
          >
            {messages.apply}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

function FilterPicker({
  label,
  help,
  title,
  placeholder,
  items,
  value,
  searchLabel,
  onSelect,
}: FilterPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const chosen = items.find((item) => item.value === value)
  return (
    <FieldGroup label={label} help={help}>
      <PickerField
        ref={anchor}
        aria-label={label}
        value={chosen?.label ?? null}
        detail={chosen?.detail}
        art={chosen && <CategoryArt name={chosen.label} icon={chosen.icon} />}
        placeholder={placeholder}
        onClick={() => setIsOpen(true)}
      />
      <PickerSheet
        title={title}
        items={[{ value: '', label: placeholder, placeholderIcon: 'list' }, ...items]}
        value={value ?? ''}
        searchLabel={searchLabel}
        anchor={anchor}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(next) => onSelect(next === '' ? undefined : next)}
      />
    </FieldGroup>
  )
}

function namesOf(accounts: readonly LedgerAccount[], { memberDirectory }: EntriesFiltersProps) {
  return {
    accounts: new Map(accounts.map((account) => [account.id, account])),
    members: new Map(memberDirectory.map((member) => [member.userId, member.displayName])),
  }
}

function accountItemsOf(accounts: readonly LedgerAccount[]): PickerItem[] {
  return accounts
    .filter((account) => LISTED_KINDS.has(account.kind) && account.archivedAt === null)
    .map((account) => ({ value: account.id, label: account.name, icon: account.icon }))
}

function categoryItemsOf(accounts: readonly LedgerAccount[]): PickerItem[] {
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
