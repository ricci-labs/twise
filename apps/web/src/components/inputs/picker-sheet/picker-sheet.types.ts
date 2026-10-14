import type { BadgeProps } from '@web/components/display/badge'
import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type {
  pickerListVariants,
  pickerPopupVariants,
} from '@web/components/inputs/picker-sheet/picker-sheet.variants'
import type { VariantProps } from 'class-variance-authority'
import type { Ref, RefObject } from 'react'

export type PickerItem = {
  value: string
  label: string
  detail?: string
  fieldDetail?: string
  badge?: string
  icon?: string | null
  placeholderIcon?: TwiseIconName
  isPerson?: boolean
  isDetailStrong?: boolean
  end?: PickerItemEnd
  hasChevron?: boolean
  children?: readonly PickerItem[]
}

export type PickerItemEnd = {
  label: string
  tone?: BadgeProps['tone']
}

export type PickerItemEndProps = {
  end: PickerItemEnd
}

export type PickerEmpty = {
  icon: string
  title: string
  text: string
  actionLabel?: string
  onAction?: () => void
}

export type PickerPopupWidth = NonNullable<VariantProps<typeof pickerPopupVariants>['width']>

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
  popupWidth?: PickerPopupWidth
  searchLabel?: string
  empty?: PickerEmpty
}

export type PickerContentProps = Omit<
  PickerSheetProps,
  'title' | 'isOpen' | 'onOpenChange' | 'anchor' | 'popupWidth'
>

export type PickerSearchProps = {
  label?: string
  value: string
  onChange: (search: string) => void
}

export type PickerChoiceProps = {
  ref?: Ref<HTMLButtonElement>
  item: PickerItem
  layout: PickerLayout
  isCurrent: boolean
  onPress: (item: PickerItem) => void
}

export type PickerRowArtProps = {
  item: PickerItem
}

export type PickerChildrenProps = {
  parent: PickerItem
  value: string | null
  onSelect: (value: string) => void
}

export type PickerEmptyStateProps = {
  empty: PickerEmpty
}
