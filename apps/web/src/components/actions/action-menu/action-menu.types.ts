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
}

export type ActionMenuProps = {
  trigger: ReactElement
  groups: readonly (readonly ActionMenuItem[])[]
  header?: ReactNode
  side?: 'top' | 'bottom' | 'right'
}

export type ActionMenuEntryProps = {
  item: ActionMenuItem
}
