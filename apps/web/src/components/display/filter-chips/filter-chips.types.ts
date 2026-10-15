export type FilterChip = {
  value: string
  label: string
}

export type FilterChipsProps = {
  chips: readonly FilterChip[]
  onRemove: (value: string) => void
  onClear: () => void
  label?: string
  clearLabel?: string
  className?: string
}
