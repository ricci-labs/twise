import type { ChargeTextRequest } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chargeTextKey } from '@web/features/settings/api/settings.queries'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useSaveChargeText(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: ChargeTextRequest) =>
      unwrap(workspaceApi.settings['charge-text'].$put({ param: { workspaceId }, json: text })),
    onSuccess: (saved) => queryClient.setQueryData(chargeTextKey(workspaceId), saved),
  })
}

export function useResetChargeText(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      unwrapEmpty(workspaceApi.settings['charge-text'].$delete({ param: { workspaceId } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chargeTextKey(workspaceId) }),
  })
}
