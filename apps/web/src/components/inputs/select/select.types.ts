import type { ComponentProps } from 'react'

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = Omit<ComponentProps<'select'>, 'children'> & {
  options: readonly SelectOption[]
  placeholder?: string
}
