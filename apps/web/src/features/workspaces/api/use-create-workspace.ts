import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => unwrap(apiClient.api.workspaces.$post({ json: { name } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
  })
}
