import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'

export function useChangeDisplayName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (displayName: string) =>
      unwrapEmpty(apiClient.api.auth.me.$patch({ json: { displayName } })),
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
