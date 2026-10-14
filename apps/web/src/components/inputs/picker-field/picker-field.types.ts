import type { ComponentProps, ReactNode } from 'react'

export type PickerFieldProps = Omit<ComponentProps<'button'>, 'value' | 'children'> & {
  value: string | null
  detail?: string
  art?: ReactNode
  placeholder: string
}
