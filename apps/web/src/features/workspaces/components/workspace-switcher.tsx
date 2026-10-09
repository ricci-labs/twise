import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import house from '@web/assets/brand/house.svg'
import { ActionMenu, type ActionMenuItem } from '@web/components/actions/action-menu'
import { workspacesQueryOptions } from '@web/features/workspaces/api/workspaces.queries'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type {
  WorkspaceListItem,
  WorkspaceSwitcherProps,
} from '@web/features/workspaces/workspaces.types'
import { ChevronsUpDown } from 'lucide-react'

const messages = workspacesMessages.shell

export function WorkspaceSwitcher({ access }: WorkspaceSwitcherProps) {
  const workspaces = useQuery(workspacesQueryOptions()).data ?? []
  const { workspace, role, memberNames } = access
  return (
    <ActionMenu
      side="top"
      header={workspacesMessages.picker.title}
      trigger={
        <button
          type="button"
          aria-label={messages.switchWorkspace(workspace.name)}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md bg-page px-2.5 py-2 text-left hover:bg-sunken"
        >
          <img src={house} alt="" className="size-7 shrink-0" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label">{workspace.name}</span>
            <span className="truncate text-caption text-ink-muted">
              {messages.roleAndPeople(role.name, memberNames.length)}
            </span>
          </span>
          <ChevronsUpDown className="size-4 text-ink-muted" aria-hidden="true" />
        </button>
      }
      groups={[
        workspaces
          .filter((item) => !item.isArchived)
          .map((item) => workspaceItem(item, workspace.workspaceId)),
        [
          {
            key: 'create',
            label: workspacesMessages.picker.create,
            icon: 'plus',
            render: <Link to="/workspaces/new" />,
          },
        ],
      ]}
    />
  )
}

function workspaceItem(item: WorkspaceListItem, currentId: string): ActionMenuItem {
  return {
    key: item.workspaceId,
    label: item.name,
    detail: item.role.name,
    icon: 'home',
    isCurrent: item.workspaceId === currentId,
    render: <Link to="/w/$workspaceId" params={{ workspaceId: item.workspaceId }} />,
  }
}
