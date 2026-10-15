import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import type { ToggleChipsProps } from '@web/components/inputs/toggle-chips/toggle-chips.types'
import {
  toggleChipsVariants,
  toggleChipVariants,
} from '@web/components/inputs/toggle-chips/toggle-chips.variants'
import { cn } from '@web/lib/cn'

export function ToggleChips({ label, options, value, onChange, className }: ToggleChipsProps) {
  return (
    <ToggleGroup
      data-slot="toggle-chips"
      aria-label={label}
      multiple
      value={[...value]}
      onValueChange={(next) => onChange(next.map(String))}
      className={cn(toggleChipsVariants(), className)}
    >
      {options.map((option) => (
        <Toggle key={option.value} value={option.value} className={toggleChipVariants()}>
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  )
}
