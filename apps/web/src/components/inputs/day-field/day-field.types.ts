import type { ComponentProps } from 'react'

export type DayFieldChange = { target: { value: string } }

export type DayFieldProps = Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'children'> & {
  value: string
  onChange: (event: DayFieldChange) => void
  onBlur?: () => void
  title: string
  summary: (day: number) => string
}

export type DaySheetProps = {
  title: string
  value: number | null
  summary: (day: number) => string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSelect: (day: number) => void
}
