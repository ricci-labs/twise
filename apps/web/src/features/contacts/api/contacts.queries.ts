import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function contactsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'list'] as const,
    queryFn: () => fetchContacts(workspaceId),
  })
}

export function contactBalancesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'balances'] as const,
    queryFn: () => fetchContactBalances(workspaceId),
  })
}

export function fetchContacts(workspaceId: string) {
  return unwrap(workspaceApi.contacts.$get({ param: { workspaceId } }))
}

export function fetchContactBalances(workspaceId: string) {
  return unwrap(workspaceApi.contacts.balances.$get({ param: { workspaceId } }))
}
