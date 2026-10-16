import type { GoalChange, NewGoal } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const goalsApi = apiClient.api.workspaces[':workspaceId'].goals

export function useCreateGoal(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (goal: NewGoal) => unwrap(goalsApi.$post({ param: { workspaceId }, json: goal })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

export function useChangeGoal(workspaceId: string, goalId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: GoalChange) =>
      unwrapEmpty(goalsApi[':goalId'].$patch({ param: { workspaceId, goalId }, json: change })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
