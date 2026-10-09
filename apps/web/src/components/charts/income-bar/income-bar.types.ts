import type { incomeBarSegmentVariants } from '@web/components/charts/income-bar/income-bar.variants'
import type { VariantProps } from 'class-variance-authority'

export type IncomeSegment = Required<VariantProps<typeof incomeBarSegmentVariants>> & {
  key: string
  label: string
  percent: number
  percentLabel: string
  amountLabel: string
}

export type IncomeBarProps = {
  segments: readonly IncomeSegment[]
  className?: string
}
