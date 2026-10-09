import type { AppModule, Permission, PermissionAction } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import type { TwiseIconName } from '@web/components/icons/twise-icon'
import type { NavItem } from '@web/components/navigation/nav-link'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { WorkspaceArea, WorkspaceNavigation } from '@web/features/workspaces/workspaces.types'
import { hasPermission } from '@web/lib/permissions'

const labels = workspacesMessages.shell.nav

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
      <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'new-entry' }} />
    ) : null,
  }
}

export function currentAreaOf(pathname: string): string | null {
  const [, , , area] = pathname.split('/')
  return area || null
}
