import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveContactRequest } from '@web/features/contacts/contacts.types'
import { unwrap, unwrapEmpty } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function useSaveContact(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: SaveContactRequest) => save(workspaceId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) }),
  })
}

async function save(workspaceId: string, request: SaveContactRequest): Promise<string> {
  if (request.kind === 'create') {
    const created = await unwrap(
      workspaceApi.contacts.$post({ param: { workspaceId }, json: request.input }),
    )
    return created.contactId
  }
  await unwrapEmpty(
    workspaceApi.contacts[':contactId'].$patch({
      param: { workspaceId, contactId: request.contactId },
      json: request.change,
    }),
  )
  return request.contactId
}
