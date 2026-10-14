import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { ReactElement } from 'react'

export type ActionElementProps = {
  className?: string
  onClick?: () => void
}

export type ItemAction = {
  key: string
  label: string
  icon: TwiseIconName
  tone?: 'neutral' | 'danger'
  onSelect?: () => void
  render?: ReactElement<ActionElementProps>
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
