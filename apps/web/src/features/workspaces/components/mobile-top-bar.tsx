import { useQuery } from '@tanstack/react-query'
import { Logo } from '@web/components/brand/logo'
import { Avatar } from '@web/components/display/avatar'
import { Sheet } from '@web/components/layout/sheet'
import { workspacesQueryOptions } from '@web/features/workspaces/api/workspaces.queries'
import { WorkspaceList } from '@web/features/workspaces/components/workspace-list'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { MobileTopBarProps } from '@web/features/workspaces/workspaces.types'
import { demoWorkspace, isDemoWorkspace } from '@web/lib/demo'
import { isReadOnly } from '@web/lib/permissions'
import { ChevronDown } from 'lucide-react'

const MAX_AVATARS = 3

export function MobileTopBar({ access }: MobileTopBarProps) {
  const demo = isDemoWorkspace(access.workspace.workspaceId)
  const listed = useQuery({ ...workspacesQueryOptions(), enabled: !demo }).data ?? []
  const workspaces = demo ? [demoWorkspace(access.workspace.workspaceId)] : listed
  const { workspace, memberNames } = access
  return (
    <header className="flex items-center justify-between gap-3 pt-2.5 pr-3 pl-2 lg:hidden">
      <div className="flex min-w-0 items-center">
        <Sheet
          title={workspacesMessages.picker.title}
          trigger={
            <button
              type="button"
              aria-label={workspacesMessages.shell.switchWorkspace(
                isReadOnly(access.permissions)
                  ? `${workspace.name}, ${access.role.name}`
                  : workspace.name,
              )}
              className="flex min-h-touch min-w-0 cursor-pointer items-center gap-2 rounded-full pr-2.5 pl-1.5 font-display text-bar-title outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <Logo variant="mark" />
              <span className="truncate">{workspace.name}</span>
              {isReadOnly(access.permissions) && (
                <span className="font-sans text-note font-medium whitespace-nowrap text-ink-muted">
                  · {access.role.name}
                </span>
              )}
              <ChevronDown className="size-4.5 shrink-0 text-ink-muted" aria-hidden="true" />
            </button>
          }
        >
          <WorkspaceList
            workspaces={workspaces.filter((item) => !item.isArchived)}
            currentId={workspace.workspaceId}
          />
        </Sheet>
      </div>
      <p className="flex -space-x-2 py-1 pr-3 pl-1">
        <span className="sr-only">{memberNames.join(', ')}</span>
        {[...new Set(memberNames)].slice(0, MAX_AVATARS).map((name, position) => (
          <Avatar key={name} name={name} tone={position === 0 ? 'paper' : 'mint'} size="stacked" />
        ))}
      </p>
    </header>
  )
}
