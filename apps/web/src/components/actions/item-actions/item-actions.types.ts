import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { ReactElement } from 'react'

export type ActionElementProps = {
  className?: string
  onClick?: () => void
}

export type ItemActionToggle = {
  isOn: boolean
  help?: string
}

export type ItemAction = {
  key: string
  label: string
  icon: TwiseIconName
  tone?: 'neutral' | 'danger'
  onSelect?: () => void
  render?: ReactElement<ActionElementProps>
  toggle?: ItemActionToggle
}

export type ItemActionsProps = {
  title: string
  description?: string
  triggerLabel: string
  actions: readonly ItemAction[]
  trigger?: ReactElement
  align?: 'start' | 'end'
  onOpenChange?: (isOpen: boolean) => void
}

export type ActionSheetProps = Omit<ItemActionsProps, 'triggerLabel' | 'trigger' | 'align'> & {
  trigger: ReactElement
}

export type ActionSheetRowProps = {
  action: ItemAction
  onDone: () => void
}

export type ActionSheetToggleProps = {
  action: ItemAction
  toggle: ItemActionToggle
}
