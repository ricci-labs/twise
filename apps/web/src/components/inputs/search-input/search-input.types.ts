import type { ComponentProps } from 'react'

export type SearchInputProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  label: string
  value: string
  onValueChange: (value: string) => void
  clearLabel?: string
}
