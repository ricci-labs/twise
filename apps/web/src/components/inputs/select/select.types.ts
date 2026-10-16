import type { selectVariants } from '@web/components/inputs/select/select.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

export type SelectOption = {
  value: string
  label: string
}

export type SelectChange = { target: { value: string } }

export type SelectProps = Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'children'> &
  VariantProps<typeof selectVariants> & {
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
