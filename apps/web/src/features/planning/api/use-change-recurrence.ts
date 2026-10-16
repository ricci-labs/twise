import type { RecurrenceRuleChange } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const ruleApi = apiClient.api.workspaces[':workspaceId'].recurrences[':ruleId']

export function useChangeRecurrence(workspaceId: string, ruleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: RecurrenceRuleChange) =>
      unwrapEmpty(ruleApi.$patch({ param: { workspaceId, ruleId }, json: change })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
