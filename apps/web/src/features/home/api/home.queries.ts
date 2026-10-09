import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
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

export function accountsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts'] as const,
    queryFn: () => unwrap(workspaceApi.accounts.$get({ param: { workspaceId } })),
  })
}

export function accountNamesQueryOptions(workspaceId: string) {
  return queryOptions({
    ...accountsQueryOptions(workspaceId),
    select: (accounts) => new Map(accounts.map((account) => [account.id, account.name])),
  })
}

export function setupQueryOptions(workspaceId: string) {
  return queryOptions({
    ...accountsQueryOptions(workspaceId),
    select: (accounts) => {
      const kinds = new Set(
        accounts.filter((account) => !account.isSystem).map((account) => account.kind),
      )
      return {
        hasMoneyAccount: MONEY_ACCOUNT_KINDS.some((kind) => kinds.has(kind)),
        hasCard: kinds.has('credit_card'),
      }
    },
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
