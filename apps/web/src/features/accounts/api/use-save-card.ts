import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveCardRequest } from '@web/features/accounts/accounts.types'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useSaveCard(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: SaveCardRequest) => save(workspaceId, request),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

async function save(workspaceId: string, request: SaveCardRequest): Promise<string> {
  if (request.kind === 'create') {
    const created = await unwrap(
      workspaceApi.cards.$post({ param: { workspaceId }, json: request.input }),
    )
    return created.accountId
  }
  const cardId = request.cardId
  if (request.rename) {
    await unwrapEmpty(
      workspaceApi.accounts[':accountId'].$patch({
        param: { workspaceId, accountId: cardId },
        json: request.rename,
      }),
    )
  }
  if (request.cycle) {
    await unwrapEmpty(
      workspaceApi.cards[':cardId'].$patch({ param: { workspaceId, cardId }, json: request.cycle }),
    )
  }
  return cardId
}
