import type { amountVariants } from '@web/components/display/amount/amount.variants'
import type { VariantProps } from 'class-variance-authority'

export type AmountProps = VariantProps<typeof amountVariants> & {
  cents: number
  sign?: 'auto' | 'always'
  isCentsRaised?: boolean
  className?: string
}

export type AmountParts = {
  sign: string
  whole: string
  cents: string
}
