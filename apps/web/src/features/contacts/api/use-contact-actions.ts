import type { ContactChange } from '@financas/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const contactApi = apiClient.api.workspaces[':workspaceId'].contacts[':contactId']

export function useChangeContact(workspaceId: string, contactId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: ContactChange) =>
      unwrapEmpty(contactApi.$patch({ param: { workspaceId, contactId }, json: change })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

export function useDeleteContact(workspaceId: string, contactId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      unwrapEmpty(contactApi.$delete({ param: { workspaceId, contactId }, json: {} })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}
