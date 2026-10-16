import type { AllocationStepInput } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { GoalDeletion } from '@web/features/planning/planning.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useDeleteGoal(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, remainingSteps }: GoalDeletion) => {
      if (remainingSteps) {
        await replaceSteps(workspaceId, remainingSteps)
      }
      await unwrapEmpty(
        workspaceApi.goals[':goalId'].$delete({ param: { workspaceId, goalId }, json: {} }),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

function replaceSteps(workspaceId: string, steps: readonly AllocationStepInput[]) {
  return unwrapEmpty(
    workspaceApi['allocation-steps'].$put({ param: { workspaceId }, json: { steps: [...steps] } }),
  )
}
