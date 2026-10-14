import type { ComponentProps, ReactNode } from 'react'

export type TextInputProps = ComponentProps<'input'> & {
  startAdornment?: ReactNode
  endAdornment?: ReactNode
}
