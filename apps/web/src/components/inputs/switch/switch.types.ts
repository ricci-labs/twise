export type SwitchProps = {
  id?: string
  label: string
  help?: string
  isChecked: boolean
  onCheckedChange: (isChecked: boolean) => void
  isDisabled?: boolean
  className?: string
}
