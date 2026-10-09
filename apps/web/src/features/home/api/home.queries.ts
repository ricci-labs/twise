import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function overviewQueryOptions(workspaceId: string, period: string | undefined) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'overview', period ?? 'current'] as const,
    queryFn: () => fetchOverview(workspaceId, period),
    placeholderData: (previous) => previous,
  })
}

export function accountNamesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts'] as const,
    queryFn: () => unwrap(workspaceApi.accounts.$get({ param: { workspaceId } })),
    select: (accounts) => new Map(accounts.map((account) => [account.id, account.name])),
  })
}

export function contactNamesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts'] as const,
    queryFn: () => unwrap(workspaceApi.contacts.$get({ param: { workspaceId } })),
    select: (contacts) => new Map(contacts.map((contact) => [contact.id, contact.name])),
  })
}

export function fetchOverview(workspaceId: string, period: string | undefined) {
  return unwrap(
    workspaceApi.overview.$get({ param: { workspaceId }, query: period ? { period } : {} }),
  )
}
