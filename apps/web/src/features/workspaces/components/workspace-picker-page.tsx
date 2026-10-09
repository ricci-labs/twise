import { useSuspenseQuery } from '@tanstack/react-query'
import { Alert } from '@web/components/feedback/alert'
import { workspacesQueryOptions } from '@web/features/workspaces/api/workspaces.queries'
import { WorkspaceList } from '@web/features/workspaces/components/workspace-list'
import { workspacesMessages } from '@web/features/workspaces/workspaces.messages'
import type { WorkspacePickerPageProps } from '@web/features/workspaces/workspaces.types'
import { usePageTitle } from '@web/hooks/use-page-title'

const messages = workspacesMessages.picker

export function WorkspacePickerPage({ isLost = false }: WorkspacePickerPageProps) {
  usePageTitle(messages.pageTitle)
  const { data: workspaces } = useSuspenseQuery(workspacesQueryOptions())
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-100 flex-col gap-4 px-4 py-10">
      <h1 className="text-title">{messages.title}</h1>
      {isLost && <Alert tone="warning">{messages.lost}</Alert>}
      <WorkspaceList workspaces={workspaces.filter((workspace) => !workspace.isArchived)} />
    </main>
  )
}
