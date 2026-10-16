import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BudgetSetRequest } from '@web/features/planning/planning.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const budgetApi = apiClient.api.workspaces[':workspaceId'].budgets[':categoryId']

export function useSetBudget(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, limitCents, fromPeriod }: BudgetSetRequest) =>
      unwrapEmpty(
        budgetApi.$put({ param: { workspaceId, categoryId }, json: { limitCents, fromPeriod } }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
