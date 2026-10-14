import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CategoryMove } from '@web/features/accounts/accounts.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const accountApi = apiClient.api.workspaces[':workspaceId'].accounts[':accountId']

export function useMoveCategory(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, parentId }: CategoryMove) =>
      unwrapEmpty(accountApi.$patch({ param: { workspaceId, accountId }, json: { parentId } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
