import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { ReactElement, ReactNode } from 'react'

export type ActionMenuItem = {
  key: string
  label: string
  detail?: string
  icon?: TwiseIconName
  render?: ReactElement
  onSelect?: () => void
  isCurrent?: boolean
  tone?: 'neutral' | 'danger'
}

export type ActionMenuProps = {
  trigger: ReactElement
  groups: readonly (readonly ActionMenuItem[])[]
  header?: ReactNode
  side?: 'top' | 'bottom' | 'right'
  align?: 'start' | 'end'
  onOpenChange?: (isOpen: boolean) => void
}

export type ActionMenuEntryProps = {
  item: ActionMenuItem
}
