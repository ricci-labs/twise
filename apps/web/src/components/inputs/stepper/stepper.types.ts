import type { stepperValueVariants } from '@web/components/inputs/stepper/stepper.variants'
import type { VariantProps } from 'class-variance-authority'

export type StepperProps = VariantProps<typeof stepperValueVariants> & {
  id?: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  valueText: string
  decreaseLabel: string
  increaseLabel: string
  lead?: string
  aside?: string
  isDisabled?: boolean
  'aria-describedby'?: string
}
