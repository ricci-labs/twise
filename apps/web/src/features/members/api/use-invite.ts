import type { InvitationRequest } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useInvite(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: InvitationRequest) =>
      unwrap(workspaceApi.invitations.$post({ param: { workspaceId }, json: request })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
