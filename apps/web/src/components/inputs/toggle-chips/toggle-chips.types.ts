export type ToggleChip = {
  value: string
  label: string
}

export type ToggleChipsProps = {
  label: string
  options: readonly ToggleChip[]
  value: readonly string[]
  onChange: (value: string[]) => void
  className?: string
}
