import type { PixReceiving } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useSetPixReceiving(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pix: PixReceiving) =>
      unwrapEmpty(workspaceApi.settings.pix.$put({ param: { workspaceId }, json: pix })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
