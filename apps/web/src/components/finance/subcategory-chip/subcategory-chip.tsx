import type { SubcategoryChipProps } from '@web/components/finance/subcategory-chip/subcategory-chip.types'
import { subcategoryChipVariants } from '@web/components/finance/subcategory-chip/subcategory-chip.variants'

export function SubcategoryChip({ label, tone = 'action', ...props }: SubcategoryChipProps) {
  if (tone !== 'action') {
    return (
      <span data-slot="subcategory-chip" className={subcategoryChipVariants({ tone })}>
        {label}
      </span>
    )
  }
  return (
    <button
      type="button"
      data-slot="subcategory-chip"
      {...props}
      className={subcategoryChipVariants({ tone })}
    >
      {label}
    </button>
  )
}
