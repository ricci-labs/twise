import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveAccountRequest } from '@web/features/accounts/accounts.types'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useSaveAccount(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: SaveAccountRequest) => save(workspaceId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

async function save(workspaceId: string, request: SaveAccountRequest): Promise<string> {
  if (request.kind === 'create') {
    const created = await unwrap(
      workspaceApi.accounts.$post({ param: { workspaceId }, json: request.input }),
    )
    return created.accountId
  }
  await unwrapEmpty(
    workspaceApi.accounts[':accountId'].$patch({
      param: { workspaceId, accountId: request.accountId },
      json: request.change,
    }),
  )
  return request.accountId
}
