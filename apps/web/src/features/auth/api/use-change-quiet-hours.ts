import type { UserPreferencesChange } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

export function useChangeQuietHours() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: UserPreferencesChange) =>
      unwrap(apiClient.api.auth.me.preferences.$patch({ json: change })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  })
}
