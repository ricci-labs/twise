import type { WorkspaceSettingsChange } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useChangeSettings(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: WorkspaceSettingsChange) =>
      unwrap(workspaceApi.settings.$patch({ param: { workspaceId }, json: change })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
