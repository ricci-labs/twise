import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useDeleteRole(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) =>
      unwrapEmpty(
        workspaceApi.roles[':roleId'].$delete({ param: { workspaceId, roleId }, json: {} }),
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
