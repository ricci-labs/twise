export type ColorPickerProps = {
  label: string
  value: string
  onSelect: (color: string) => void
  onBlur?: () => void
  isDisabled?: boolean
}
