import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useCancelCharge(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chargeId: string) =>
      unwrapEmpty(
        workspaceApi.charges[':chargeId'].cancel.$post({ param: { workspaceId, chargeId } }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
