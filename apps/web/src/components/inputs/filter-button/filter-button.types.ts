import type { ComponentProps } from 'react'

export type FilterButtonProps = ComponentProps<'button'> & {
  label: string
  value?: string
  isActive?: boolean
  hasMenu?: boolean
}
