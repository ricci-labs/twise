import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { OccurrenceActionRequest } from '@web/features/planning/planning.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const occurrenceApi = apiClient.api.workspaces[':workspaceId'].occurrences[':occurrenceId']

export function useOccurrenceAction(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: OccurrenceActionRequest) => send(workspaceId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

function send(workspaceId: string, request: OccurrenceActionRequest): Promise<void> {
  const param = { param: { workspaceId, occurrenceId: request.occurrenceId } }
  switch (request.action) {
    case 'skip':
      return unwrapEmpty(occurrenceApi.skip.$post(param))
    case 'unskip':
      return unwrapEmpty(occurrenceApi.unskip.$post(param))
    case 'unmatch':
      return unwrapEmpty(occurrenceApi.unmatch.$post(param))
    case 'match':
      return unwrapEmpty(
        occurrenceApi.match.$post({ ...param, json: { entryId: request.entryId } }),
      )
    case 'amount':
      return unwrapEmpty(
        occurrenceApi.$patch({ ...param, json: { amountCents: request.amountCents } }),
      )
  }
}
