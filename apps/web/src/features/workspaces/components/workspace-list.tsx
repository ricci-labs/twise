import { Link } from '@tanstack/react-router'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { WorkspaceListProps } from '@web/features/workspaces/workspaces.types'

export function WorkspaceList({ workspaces, currentId }: WorkspaceListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {workspaces.map((workspace) => (
        <li key={workspace.workspaceId}>
          <Link
            to="/w/$workspaceId"
            params={{ workspaceId: workspace.workspaceId }}
            aria-current={workspace.workspaceId === currentId ? 'page' : undefined}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-sunken aria-[current=page]:bg-mint-soft"
          >
            <TwiseIcon
              name="home"
              tone={workspace.workspaceId === currentId ? 'selected' : 'muted'}
            />
            <span className="flex flex-col">
              <span className="text-body font-semibold">{workspace.name}</span>
              <span className="text-body-sm text-ink-muted">{workspace.role.name}</span>
            </span>
          </Link>
        </li>
      ))}
      <li>
        <Link
          to="/workspaces/new"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-mint-ink hover:bg-sunken"
        >
          <TwiseIcon name="plus" />
          <span className="text-body font-semibold">{workspacesMessages.picker.create}</span>
        </Link>
      </li>
    </ul>
  )
}
