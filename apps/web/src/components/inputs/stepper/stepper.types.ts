export type StepperProps = {
  id?: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  valueText: string
  decreaseLabel: string
  increaseLabel: string
  aside?: string
  isDisabled?: boolean
  'aria-describedby'?: string
}
