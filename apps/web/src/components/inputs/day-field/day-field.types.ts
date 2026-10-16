import type { dayFieldVariants } from '@web/components/inputs/day-field/day-field.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

export type DayFieldChange = { target: { value: string } }

export type DayFieldProps = Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'children'> &
  VariantProps<typeof dayFieldVariants> & {
    value: string
    onChange: (event: DayFieldChange) => void
    onBlur?: () => void
    title: string
    summary: (day: number) => string
  }

export type DaySheetProps = {
  anchor: Element | null
  title: string
  value: number | null
  summary: (day: number) => string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSelect: (day: number) => void
}
