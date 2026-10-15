import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const ruleApi = apiClient.api.workspaces[':workspaceId'].recurrences[':ruleId']

export function useDeleteRecurrence(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ruleId: string) =>
      unwrapEmpty(ruleApi.$delete({ param: { workspaceId, ruleId }, json: {} })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
