import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EntryChange } from '@web/features/entries/entries.types'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const entryApi = apiClient.api.workspaces[':workspaceId'].entries[':entryId']

export function useChangeEntry(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (change: EntryChange): Promise<string> => {
      const param = { workspaceId, entryId: change.entryId }
      if (change.mode === 'details') {
        await unwrapEmpty(
          entryApi.$patch({
            param,
            json: { description: change.description, notes: change.notes || null },
          }),
        )
        return change.entryId
      }
      const replacement = await unwrap(entryApi.$put({ param, json: change.input }))
      return replacement.entryId
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
