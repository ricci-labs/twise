import type { AllocationStepInput } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const stepsApi = apiClient.api.workspaces[':workspaceId']['allocation-steps']

export function useSaveSplit(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (steps: readonly AllocationStepInput[]) =>
      unwrapEmpty(stepsApi.$put({ param: { workspaceId }, json: { steps: [...steps] } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
