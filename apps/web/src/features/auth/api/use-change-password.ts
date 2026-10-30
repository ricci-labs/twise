import type { PasswordChangeRequest } from '@financas/shared'
import { useMutation } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'

export function useChangePassword() {
  return useMutation({
    mutationFn: (request: PasswordChangeRequest) =>
      unwrapEmpty(apiClient.api.auth.password.change.$post({ json: request })),
  })
}
