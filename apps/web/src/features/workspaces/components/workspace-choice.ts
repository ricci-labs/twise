import type { QueryClient } from '@tanstack/react-query'
import { workspacesQueryOptions } from '@web/features/workspaces/api/workspaces.queries'
import type { WorkspaceChoice, WorkspaceListItem } from '@web/features/workspaces/workspaces.types'
import { lastWorkspaceId } from '@web/lib/last-workspace'

export async function chooseWorkspace(queryClient: QueryClient): Promise<WorkspaceChoice> {
  const workspaces = await queryClient.ensureQueryData(workspacesQueryOptions())
  return workspaceChoiceOf(workspaces, lastWorkspaceId())
}

export function workspaceChoiceOf(
  workspaces: readonly WorkspaceListItem[],
  lastUsedId: string | null,
): WorkspaceChoice {
  const active = workspaces.filter((workspace) => !workspace.isArchived)
  const lastUsed = active.find((workspace) => workspace.workspaceId === lastUsedId)
  if (lastUsed) {
    return { kind: 'open', workspaceId: lastUsed.workspaceId }
  }
  const [only, ...others] = active
  if (!only) {
    return { kind: 'create' }
  }
  return others.length === 0 ? { kind: 'open', workspaceId: only.workspaceId } : { kind: 'pick' }
}
