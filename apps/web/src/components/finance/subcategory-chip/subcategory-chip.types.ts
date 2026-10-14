import type { subcategoryChipVariants } from '@web/components/finance/subcategory-chip/subcategory-chip.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'

export type SubcategoryChipProps = VariantProps<typeof subcategoryChipVariants> &
  Omit<ComponentPropsWithRef<'button'>, 'className' | 'children'> & {
    label: string
  }
