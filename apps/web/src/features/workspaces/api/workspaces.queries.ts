import { type QueryClient, queryOptions } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { ApiError } from '@web/lib/api/api-error'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { rememberWorkspace } from '@web/lib/last-workspace'
import { queryKeys } from '@web/lib/query-keys'

const WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND'

export function workspacesQueryOptions() {
  return queryOptions({ queryKey: queryKeys.workspaces, queryFn: fetchWorkspaces })
}

export function workspaceAccessQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'access'] as const,
    queryFn: () => fetchWorkspaceAccess(workspaceId),
  })
}

export async function openWorkspace(queryClient: QueryClient, workspaceId: string) {
  try {
    const access = await queryClient.ensureQueryData(workspaceAccessQueryOptions(workspaceId))
    rememberWorkspace(workspaceId)
    return { access }
  } catch (error) {
    if (error instanceof ApiError && error.code === WORKSPACE_NOT_FOUND) {
      throw redirect({ to: '/workspaces', search: { lost: true } })
    }
    throw error
  }
}

export function fetchWorkspaces() {
  return unwrap(apiClient.api.workspaces.$get())
}

export function fetchWorkspaceAccess(workspaceId: string) {
  return unwrap(apiClient.api.workspaces[':workspaceId'].$get({ param: { workspaceId } }))
}
