import type { NewHoliday } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useAddHoliday(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (holiday: NewHoliday) =>
      unwrap(workspaceApi.holidays.$post({ param: { workspaceId }, json: holiday })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
