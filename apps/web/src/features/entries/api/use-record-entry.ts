import type { EntryInput } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

export function useRecordEntry(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EntryInput) =>
      unwrap(
        apiClient.api.workspaces[':workspaceId'].entries.$post({
          param: { workspaceId },
          json: input,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
