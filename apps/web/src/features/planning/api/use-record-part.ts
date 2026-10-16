import type { AllocationPartInput } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const partsApi = apiClient.api.workspaces[':workspaceId']['allocation-parts']

export function useRecordPart(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (part: AllocationPartInput) =>
      unwrapEmpty(partsApi.$post({ param: { workspaceId }, json: part })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
