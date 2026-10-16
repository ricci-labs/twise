import type { NewRecurrenceRule } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const recurrencesApi = apiClient.api.workspaces[':workspaceId'].recurrences

export function useCreateRecurrence(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rule: NewRecurrenceRule) =>
      unwrap(recurrencesApi.$post({ param: { workspaceId }, json: rule })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
