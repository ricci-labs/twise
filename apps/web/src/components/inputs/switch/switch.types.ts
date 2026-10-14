export type SwitchProps = {
  id?: string
  label: string
  isChecked: boolean
  onCheckedChange: (isChecked: boolean) => void
  isDisabled?: boolean
  className?: string
}
