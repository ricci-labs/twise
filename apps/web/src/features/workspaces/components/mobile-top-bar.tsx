import { useQuery } from '@tanstack/react-query'
import { Logo } from '@web/components/brand/logo'
import { Avatar } from '@web/components/display/avatar'
import { Sheet } from '@web/components/layout/sheet'
import { workspacesQueryOptions } from '@web/features/workspaces/api/workspaces.queries'
import { WorkspaceList } from '@web/features/workspaces/components/workspace-list'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { MobileTopBarProps } from '@web/features/workspaces/workspaces.types'
import { isReadOnly } from '@web/lib/permissions'
import { ChevronDown } from 'lucide-react'

const MAX_AVATARS = 3

export function MobileTopBar({ access }: MobileTopBarProps) {
  const workspaces = useQuery(workspacesQueryOptions()).data ?? []
  const { workspace, memberNames } = access
  return (
    <header className="flex items-center justify-between gap-3 px-4 pt-4 lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <Logo variant="icon" />
        <Sheet
          title={workspacesMessages.picker.title}
          trigger={
            <button
              type="button"
              aria-label={workspacesMessages.shell.switchWorkspace(workspace.name)}
              className="flex min-w-0 cursor-pointer items-center gap-1 text-title"
            >
              <span className="truncate">{workspace.name}</span>
              {isReadOnly(access.permissions) && (
                <span className="text-body-sm font-medium whitespace-nowrap text-ink-muted">
                  · {access.role.name}
                </span>
              )}
              <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            </button>
          }
        >
          <WorkspaceList
            workspaces={workspaces.filter((item) => !item.isArchived)}
            currentId={workspace.workspaceId}
          />
        </Sheet>
      </div>
      <p className="flex -space-x-2">
        <span className="sr-only">{memberNames.join(', ')}</span>
        {[...new Set(memberNames)].slice(0, MAX_AVATARS).map((name, position) => (
          <Avatar
            key={name}
            name={name}
            tone={position === 0 ? 'paper' : 'mint'}
            className="ring-2 ring-page"
          />
        ))}
      </p>
    </header>
  )
}
