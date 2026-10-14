import type { ComponentProps, ReactNode } from 'react'

export type PickerFieldProps = Omit<ComponentProps<'button'>, 'value' | 'children'> & {
  value: string | null
  parentLabel?: string
  detail?: string
  badge?: string
  art?: ReactNode
  placeholder: string
}
