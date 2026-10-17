import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useCreateCharge(workspaceId: string, contactId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (until: string) =>
      unwrap(
        workspaceApi.contacts[':contactId'].charges.$post({
          param: { workspaceId, contactId },
          json: { until },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

export function useMarkChargeSent(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ chargeId, via }: { chargeId: string; via: 'whatsapp' | 'manual' }) =>
      unwrapEmpty(
        workspaceApi.charges[':chargeId'].sent.$post({
          param: { workspaceId, chargeId },
          json: { via },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

export function useSendChargeEmail(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chargeId: string) =>
      unwrapEmpty(
        workspaceApi.charges[':chargeId']['send-email'].$post({
          param: { workspaceId, chargeId },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
