import { useMutation } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'

export function useOptOut() {
  return useMutation({
    mutationFn: (token: string) =>
      unwrap(apiClient.api.public.contacts['opt-out'].$post({ json: { token } })),
  })
}
