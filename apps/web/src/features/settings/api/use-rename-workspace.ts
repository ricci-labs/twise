import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useRenameWorkspace(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      unwrapEmpty(workspaceApi.$patch({ param: { workspaceId }, json: { name } })),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}
