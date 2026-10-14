import type { SelectProps } from '@web/components/inputs/select/select.types'
import { selectBoxVariants, selectVariants } from '@web/components/inputs/select/select.variants'
import { cn } from '@web/lib/cn'
import { ChevronDown } from 'lucide-react'

const NO_CHOICE = ''

export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <div data-slot="select" className={cn(selectBoxVariants(), className)}>
      <select className={selectVariants()} {...props}>
        {placeholder !== undefined && <option value={NO_CHOICE}>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" />
    </div>
  )
}
