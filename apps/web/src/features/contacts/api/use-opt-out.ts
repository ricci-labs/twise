import { useMutation } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'

export function useOptOut() {
  return useMutation({
    mutationFn: (token: string) =>
      unwrapEmpty(apiClient.api.public.contacts['opt-out'].$post({ json: { token } })),
  })
}
