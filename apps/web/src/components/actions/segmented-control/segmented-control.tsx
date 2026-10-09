import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import type { SegmentedControlProps } from '@web/components/actions/segmented-control/segmented-control.types'
import {
  segmentedControlVariants,
  segmentedOptionVariants,
} from '@web/components/actions/segmented-control/segmented-control.variants'
import { cn } from '@web/lib/cn'

export function SegmentedControl({
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  return (
    <ToggleGroup
      data-slot="segmented-control"
      aria-label={label}
      value={[value]}
      onValueChange={(next) => {
        const [picked] = next
        if (picked) {
          onValueChange(String(picked))
        }
      }}
      className={cn(segmentedControlVariants(), className)}
    >
      {options.map((option) => (
        <Toggle key={option.value} value={option.value} className={segmentedOptionVariants()}>
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  )
}
