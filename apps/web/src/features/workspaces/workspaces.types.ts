import type { AppModule, PermissionAction } from '@financas/shared'
import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { NavItem } from '@web/components/navigation/nav-link'
import type {
  fetchWorkspaceAccess,
  fetchWorkspaces,
} from '@web/features/workspaces/api/workspaces.queries'
import type { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { workspacePickerSearchSchema } from '@web/features/workspaces/workspaces.schemas'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import type { z } from 'zod'

export type WorkspacePickerSearch = z.infer<typeof workspacePickerSearchSchema>

export type WorkspaceListItem = Awaited<ReturnType<typeof fetchWorkspaces>>[number]

export type WorkspaceAccess = Awaited<ReturnType<typeof fetchWorkspaceAccess>>

export type WorkspaceChoice =
  | { kind: 'open'; workspaceId: string }
  | { kind: 'pick' }
  | { kind: 'create' }

export type CreateWorkspacePageProps = {
  email: string
  logOut: ReactNode
}

export type WorkspaceListProps = {
  workspaces: readonly WorkspaceListItem[]
  currentId?: string
}

export type WorkspacePickerPageProps = {
  isLost?: boolean
}

export type WorkspaceAreaKey = Exclude<keyof typeof workspacesMessages.shell.nav, 'home' | 'more'>

export type WorkspaceArea = {
  key: WorkspaceAreaKey
  icon: TwiseIconName
  module: AppModule
  action?: PermissionAction
}

export type WorkspaceNavigation = {
  main: NavItem[]
  more: NavItem[]
  newEntry: ReactElement<ComponentProps<'a'>> | null
}

export type WorkspaceShellProps = {
  workspaceId: string
  accountMenu: ReactNode
  accountActions: ReactNode
  children: ReactNode
}

export type WorkspaceSwitcherProps = {
  access: WorkspaceAccess
}

export type MoreSheetProps = {
  items: readonly NavItem[]
  accountActions: ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export type MobileTopBarProps = {
  access: WorkspaceAccess
}

export type ComingSoonPageProps = {
  workspaceId: string
}
