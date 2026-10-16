import type { AppModule, Permission, PermissionAction } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { NavItem } from '@web/components/navigation/nav-link'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { WorkspaceArea, WorkspaceNavigation } from '@web/features/workspaces/workspaces.types'
import { hasPermission } from '@web/lib/permissions'

const ENTRIES_AREA = 'entries'

const labels = workspacesMessages.shell.nav

const NEW_ENTRY = 'new'

const TRASH_PAGE = 'trash'
const PLANNING_AREA = 'planning'
const SPLIT_PAGE = 'split'
const COMMISSION_SPLIT_PAGE = 'commission-split'

const SETTINGS_AREA = 'settings'

const AREA_OF_PAGE: Readonly<Record<string, string>> = { categories: 'accounts' }

const TAB_OF_AREA: Readonly<Record<string, string>> = { [TRASH_PAGE]: ENTRIES_AREA }

const MAIN_AREAS: readonly WorkspaceArea[] = [
  { key: 'entries', icon: 'list', module: 'entries' },
  { key: 'cards', icon: 'card', module: 'cards' },
  { key: 'planning', icon: 'plan', module: 'planning' },
]

const MORE_AREAS: readonly WorkspaceArea[] = [
  { key: 'contacts', icon: 'users', module: 'contacts' },
  { key: 'accounts', icon: 'wallet', module: 'accounts' },
  { key: 'members', icon: 'shield', module: 'members' },
  { key: 'settings', icon: 'sliders', module: 'settings' },
  { key: 'history', icon: 'history', module: 'audit' },
  { key: 'trash', icon: 'trash', module: 'entries', action: 'delete' },
]

export function workspaceNavigation(
  workspaceId: string,
  permissions: readonly Permission[],
  currentArea: string | null,
): WorkspaceNavigation {
  const can = (module: AppModule, action: PermissionAction = 'view') =>
    hasPermission(permissions, module, action)
  const areaItem = ({ key, icon }: WorkspaceArea): NavItem => ({
    key,
    label: labels[key],
    icon,
    render: <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: key }} />,
    isCurrent: currentArea === key,
  })
  const home: NavItem = {
    key: 'home',
    label: labels.home,
    icon: 'home' satisfies TwiseIconName,
    render: <Link to="/w/$workspaceId" params={{ workspaceId }} activeOptions={{ exact: true }} />,
    isCurrent: currentArea === null,
  }
  const visible = (area: WorkspaceArea) => can(area.module, area.action)
  return {
    main: [home, ...MAIN_AREAS.filter(visible).map(areaItem)],
    more: MORE_AREAS.filter(visible).map(areaItem),
    newEntry: can('entries', 'create') ? (
      <Link to="." search={(previous) => ({ ...previous, entry: NEW_ENTRY })} data-write="" />
    ) : null,
  }
}

export function hasNewEntryButton(pathname: string): boolean {
  const [, , , area, item] = pathname.split('/')
  if (area === TRASH_PAGE || item === TRASH_PAGE || area === SETTINGS_AREA) {
    return false
  }
  if (area === COMMISSION_SPLIT_PAGE || (area === PLANNING_AREA && item === SPLIT_PAGE)) {
    return false
  }
  return !(area === ENTRIES_AREA && item !== undefined && item !== '')
}

export function currentAreaOf(pathname: string): string | null {
  const [, , , area] = pathname.split('/')
  return area ? (AREA_OF_PAGE[area] ?? area) : null
}

export function tabAreaOf(area: string | null): string | null {
  return area ? (TAB_OF_AREA[area] ?? area) : null
}
