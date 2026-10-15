import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EntryActionRequest } from '@web/features/entries/entries.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useEntryAction(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: EntryActionRequest) => {
      if (request.action === 'restoreAccount') {
        return unwrapEmpty(
          workspaceApi.accounts[':accountId'].restore.$post({
            param: { workspaceId, accountId: request.accountId },
          }),
        )
      }
      const param = { param: { workspaceId, entryId: request.entryId } }
      return request.action === 'delete'
        ? unwrapEmpty(
            workspaceApi.entries[':entryId'].$delete({
              ...param,
              json: request.reason ? { reason: request.reason } : {},
            }),
          )
        : unwrapEmpty(workspaceApi.entries[':entryId'].restore.$post(param))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
