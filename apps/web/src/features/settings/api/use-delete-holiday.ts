import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useDeleteHoliday(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (holidayId: string) =>
      unwrapEmpty(
        workspaceApi.holidays[':holidayId'].$delete({
          param: { workspaceId, holidayId },
          json: {},
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
