import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useLeaveWorkspace(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => unwrapEmpty(workspaceApi.members.leave.$post({ param: { workspaceId } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
  })
}
