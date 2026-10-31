import { AUDIT_AREA_KEYS, AUTOMATIC_ACTOR } from '@financas/shared'
import { FilterButton } from '@web/components/inputs/filter-button'
import { type PickerItem, PickerSheet } from '@web/components/inputs/picker-sheet'
import { auditMessages } from '@web/features/audit/audit.messages'
import type { HistoryFilterMenuProps, HistoryFiltersProps } from '@web/features/audit/audit.types'
import { useMemo, useRef, useState } from 'react'

const messages = auditMessages.filters
const ALL = ''

export function HistoryFilters({ search, onSearchChange, memberDirectory }: HistoryFiltersProps) {
  const areaItems = useMemo<PickerItem[]>(
    () => [
      { value: ALL, label: messages.allAreas },
      ...AUDIT_AREA_KEYS.map((area) => ({ value: area, label: auditMessages.areas[area] })),
    ],
    [],
  )
  const actorItems = useMemo<PickerItem[]>(
    () => [
      { value: ALL, label: messages.everyone },
      ...memberDirectory.map((member) => ({
        value: member.userId,
        label: member.displayName,
      })),
      { value: AUTOMATIC_ACTOR, label: auditMessages.automatic },
    ],
    [memberDirectory],
  )
  return (
    <fieldset aria-label={messages.label} className="flex min-w-0 flex-wrap items-center gap-2">
      <HistoryFilterMenu
        label={messages.area}
        items={areaItems}
        value={search.area}
        onSelect={(area) => onSearchChange({ area: area as typeof search.area, event: undefined })}
      />
      <HistoryFilterMenu
        label={messages.actor}
        items={actorItems}
        value={search.actor}
        onSelect={(actor) => onSearchChange({ actor, event: undefined })}
      />
    </fieldset>
  )
}

function HistoryFilterMenu({ label, items, value, onSelect }: HistoryFilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const chosen = value ? items.find((item) => item.value === value)?.label : undefined
  return (
    <>
      <FilterButton
        ref={anchor}
        label={label}
        value={chosen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      />
      <PickerSheet
        title={label}
        items={items}
        value={value ?? ALL}
        anchor={anchor}
        layout="options"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(next) => {
          setIsOpen(false)
          onSelect(next === ALL ? undefined : next)
        }}
      />
    </>
  )
}
