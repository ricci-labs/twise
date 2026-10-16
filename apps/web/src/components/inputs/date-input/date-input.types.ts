import type { IsoDate } from '@financas/shared'
import type { ComponentProps } from 'react'

export type DateInputChange = { target: { value: string } }

export type DateInputProps = Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'children'> & {
  value: string
  onChange: (event: DateInputChange) => void
  onBlur?: () => void
  title: string
  today: IsoDate
  placeholder?: string
}
