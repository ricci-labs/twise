import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
const LATEST_ENTRIES_LIMIT = '50'

export function accountsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts'] as const,
    queryFn: () => fetchAccounts(workspaceId),
  })
}

export function balancesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'balances'] as const,
    queryFn: () => fetchBalances(workspaceId),
  })
}

export function cardsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'cards'] as const,
    queryFn: () => fetchCards(workspaceId),
  })
}

export function contactsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'list'] as const,
    queryFn: () => fetchContacts(workspaceId),
  })
}

export function membersQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'members'] as const,
    queryFn: () => fetchMembers(workspaceId),
  })
}

export function latestEntriesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'latest'] as const,
    queryFn: () => fetchLatestEntries(workspaceId),
  })
}

export function fetchAccounts(workspaceId: string) {
  return unwrap(workspaceApi.accounts.$get({ param: { workspaceId } }))
}

export function fetchBalances(workspaceId: string) {
  return unwrap(workspaceApi.balances.$get({ param: { workspaceId } }))
}

export function fetchCards(workspaceId: string) {
  return unwrap(workspaceApi.cards.$get({ param: { workspaceId } }))
}

export function fetchContacts(workspaceId: string) {
  return unwrap(workspaceApi.contacts.$get({ param: { workspaceId } }))
}

export function fetchMembers(workspaceId: string) {
  return unwrap(workspaceApi.members.$get({ param: { workspaceId } }))
}

export function fetchLatestEntries(workspaceId: string) {
  return unwrap(
    workspaceApi.entries.$get({ param: { workspaceId }, query: { limit: LATEST_ENTRIES_LIMIT } }),
  )
}
