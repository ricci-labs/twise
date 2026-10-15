import type {
  segmentedControlVariants,
  segmentedOptionVariants,
} from '@web/components/actions/segmented-control/segmented-control.variants'
import type { VariantProps } from 'class-variance-authority'

export type SegmentedOption = {
  value: string
  label: string
}

export type SegmentedControlProps = VariantProps<typeof segmentedControlVariants> &
  Pick<VariantProps<typeof segmentedOptionVariants>, 'selection'> & {
    label: string
    options: readonly SegmentedOption[]
    value: string
    onValueChange: (value: string) => void
    className?: string
  }
