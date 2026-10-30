import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MemberRoleChange } from '@web/features/members/members.types'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useChangeMemberRole(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ membershipId, roleId }: MemberRoleChange) =>
      unwrapEmpty(
        workspaceApi.members[':membershipId'].$patch({
          param: { workspaceId, membershipId },
          json: { roleId },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
