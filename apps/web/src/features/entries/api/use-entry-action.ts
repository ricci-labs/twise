import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EntryActionRequest } from '@web/features/entries/entries.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const entryApi = apiClient.api.workspaces[':workspaceId'].entries[':entryId']

export function useEntryAction(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ action, entryId, reason }: EntryActionRequest) => {
      const param = { param: { workspaceId, entryId } }
      return action === 'delete'
        ? unwrapEmpty(entryApi.$delete({ ...param, json: reason ? { reason } : {} }))
        : unwrapEmpty(entryApi.restore.$post(param))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
