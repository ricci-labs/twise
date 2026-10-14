import type { pickerListVariants } from '@web/components/inputs/picker-sheet/picker-sheet.variants'
import type { VariantProps } from 'class-variance-authority'
import type { RefObject } from 'react'

export type PickerItem = {
  value: string
  label: string
  detail?: string
  icon?: string | null
  children?: readonly PickerItem[]
}

export type PickerEmpty = {
  icon: string
  title: string
  text: string
  actionLabel?: string
  onAction?: () => void
}

export type PickerLayout = NonNullable<VariantProps<typeof pickerListVariants>['layout']>

export type PickerSheetProps = {
  title: string
  subtitle?: string
  items: readonly PickerItem[]
  value: string | null
  onSelect: (value: string) => void
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  anchor?: RefObject<HTMLElement | null>
  layout?: PickerLayout
  searchLabel?: string
  empty?: PickerEmpty
}

export type PickerContentProps = Omit<
  PickerSheetProps,
  'title' | 'isOpen' | 'onOpenChange' | 'anchor'
>

export type PickerChoiceProps = {
  item: PickerItem
  layout: PickerLayout
  isCurrent: boolean
  onPress: (item: PickerItem) => void
}

export type PickerChildrenProps = {
  parent: PickerItem
  value: string | null
  onSelect: (value: string) => void
}

export type PickerEmptyStateProps = {
  empty: PickerEmpty
}
