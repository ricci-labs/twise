import type { FilterButtonProps } from '@web/components/inputs/filter-button/filter-button.types'
import {
  filterButtonValueVariants,
  filterButtonVariants,
} from '@web/components/inputs/filter-button/filter-button.variants'
import { cn } from '@web/lib/cn'
import { ChevronDown } from 'lucide-react'

export function FilterButton({
  label,
  value,
  isActive = value !== undefined,
  hasMenu = true,
  className,
  ...props
}: FilterButtonProps) {
  return (
    <button
      type="button"
      data-slot="filter-button"
      data-active={isActive ? '' : undefined}
      className={cn(filterButtonVariants(), className)}
      {...props}
    >
      <span>
        {label}
        {value !== undefined && (
          <>
            {': '}
            <span className={filterButtonValueVariants()}>{value}</span>
          </>
        )}
      </span>
      {hasMenu && <ChevronDown aria-hidden="true" />}
    </button>
  )
}
