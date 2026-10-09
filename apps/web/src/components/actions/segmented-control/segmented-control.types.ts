export type SegmentedOption = {
  value: string
  label: string
}

export type SegmentedControlProps = {
  label: string
  options: readonly SegmentedOption[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}
