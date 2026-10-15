import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { OccurrenceMatchRequest } from '@web/features/entries/entries.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const occurrenceApi = apiClient.api.workspaces[':workspaceId'].occurrences[':occurrenceId']

export function useMatchOccurrence(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ occurrenceId, entryId }: OccurrenceMatchRequest) =>
      unwrapEmpty(
        occurrenceApi.match.$post({ param: { workspaceId, occurrenceId }, json: { entryId } }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
