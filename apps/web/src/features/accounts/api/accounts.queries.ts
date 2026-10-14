import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

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

export function accountsSummaryQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts-summary'] as const,
    queryFn: () => fetchAccountsSummary(workspaceId),
  })
}

export function cardsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'cards'] as const,
    queryFn: () => fetchCards(workspaceId),
  })
}

export function membersQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'members'] as const,
    queryFn: () => fetchMembers(workspaceId),
  })
}

export function trashedAccountsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts-trash'] as const,
    queryFn: () => fetchTrashedAccounts(workspaceId),
  })
}

export function fetchTrashedAccounts(workspaceId: string) {
  return unwrap(workspaceApi.accounts.trash.$get({ param: { workspaceId } }))
}

export function fetchAccounts(workspaceId: string) {
  return unwrap(workspaceApi.accounts.$get({ param: { workspaceId } }))
}

export function fetchBalances(workspaceId: string) {
  return unwrap(workspaceApi.balances.$get({ param: { workspaceId } }))
}

export function fetchAccountsSummary(workspaceId: string) {
  return unwrap(workspaceApi.accounts.summary.$get({ param: { workspaceId } }))
}

export function fetchCards(workspaceId: string) {
  return unwrap(workspaceApi.cards.$get({ param: { workspaceId } }))
}

export function fetchMembers(workspaceId: string) {
  return unwrap(workspaceApi.members.$get({ param: { workspaceId } }))
}
