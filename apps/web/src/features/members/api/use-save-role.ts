import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { RoleSave } from '@web/features/members/members.types'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useSaveRole(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roleId, role }: RoleSave) => {
      if (roleId === null) {
        await unwrap(workspaceApi.roles.$post({ param: { workspaceId }, json: role }))
        return
      }
      await unwrapEmpty(
        workspaceApi.roles[':roleId'].$patch({ param: { workspaceId, roleId }, json: role }),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
