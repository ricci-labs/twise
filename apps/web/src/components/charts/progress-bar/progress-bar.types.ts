import type { progressBarVariants } from '@web/components/charts/progress-bar/progress-bar.variants'
import type { VariantProps } from 'class-variance-authority'

export type ProgressBarProps = VariantProps<typeof progressBarVariants> & {
  percent: number
  markPercent?: number
  className?: string
}
