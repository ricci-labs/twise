import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MemberRemoval } from '@web/features/members/members.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ membershipId, reason }: MemberRemoval) =>
      unwrapEmpty(
        workspaceApi.members[':membershipId'].$delete({
          param: { workspaceId, membershipId },
          json: reason === undefined ? {} : { reason },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
