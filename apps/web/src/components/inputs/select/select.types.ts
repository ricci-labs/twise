import type { ComponentProps } from 'react'

export type SelectOption = {
  value: string
  label: string
}

export type SelectChange = { target: { value: string } }

export type SelectProps = Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'children'> & {
  title: string
  options: readonly SelectOption[]
  placeholder?: string
  value: string
  onChange: (event: SelectChange) => void
  onBlur?: () => void
}

export type SelectExampleProps = {
  initial: string
}
