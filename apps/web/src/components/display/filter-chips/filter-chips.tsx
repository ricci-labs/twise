import { Button } from '@web/components/actions/button'
import { filterChipsMessages as messages } from '@web/components/display/filter-chips/filter-chips.messages'
import type { FilterChipsProps } from '@web/components/display/filter-chips/filter-chips.types'
import {
  filterChipsVariants,
  filterChipVariants,
} from '@web/components/display/filter-chips/filter-chips.variants'
import { cn } from '@web/lib/cn'
import { X } from 'lucide-react'

export function FilterChips({
  chips,
  onRemove,
  onClear,
  label = messages.label,
  clearLabel = messages.clear,
  className,
}: FilterChipsProps) {
  if (chips.length === 0) {
    return null
  }
  return (
    <fieldset
      aria-label={label}
      data-slot="filter-chips"
      className={cn(filterChipsVariants(), className)}
    >
      {chips.map((chip) => (
        <button
          key={chip.value}
          type="button"
          aria-label={messages.remove(chip.label)}
          className={filterChipVariants()}
          onClick={() => onRemove(chip.value)}
        >
          {chip.label}
          <X aria-hidden="true" />
        </button>
      ))}
      <Button variant="tertiary" size="xs" onClick={onClear}>
        {clearLabel}
      </Button>
    </fieldset>
  )
}
