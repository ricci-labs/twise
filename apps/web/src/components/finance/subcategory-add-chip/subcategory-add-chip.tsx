import type { SubcategoryAddChipProps } from '@web/components/finance/subcategory-add-chip/subcategory-add-chip.types'
import { subcategoryAddChipVariants } from '@web/components/finance/subcategory-add-chip/subcategory-add-chip.variants'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { cloneElement } from 'react'

export function SubcategoryAddChip({ label, link }: SubcategoryAddChipProps) {
  return cloneElement(
    link,
    { 'aria-label': label, className: subcategoryAddChipVariants() },
    <TwiseIcon name="plus" />,
  )
}
