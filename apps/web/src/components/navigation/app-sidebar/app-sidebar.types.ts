import type { NavItem } from '@web/components/navigation/nav-link'
import type { ReactElement, ReactNode } from 'react'

export type SidebarAction = {
  label: string
  render: ReactElement
}

export type AppSidebarProps = {
  items: readonly NavItem[]
  moreItems: readonly NavItem[]
  primaryAction?: SidebarAction
  foot: ReactNode
  isCollapsed: boolean
  onToggle: () => void
  className?: string
}

export type SidebarNavListProps = {
  items: readonly NavItem[]
  isCollapsed: boolean
}

export type SidebarLabelProps = {
  label: string
  isCollapsed: boolean
  children: ReactElement
}
