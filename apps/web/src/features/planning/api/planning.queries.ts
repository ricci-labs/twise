import type { IsoDate } from '@financas/shared'
import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
const PERIODS_FRESH_MS = 60 * 60 * 1000

export function periodsQueryOptions(workspaceId: string, year: number | undefined) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'periods', year ?? 'current'] as const,
    queryFn: () => fetchPeriods(workspaceId, year),
    staleTime: PERIODS_FRESH_MS,
  })
}

export function accountsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts'] as const,
    queryFn: () => fetchAccounts(workspaceId),
  })
}

export function occurrencesQueryOptions(workspaceId: string, from: IsoDate, to: IsoDate) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'occurrences', from, to] as const,
    queryFn: () => fetchOccurrences(workspaceId, from, to),
    placeholderData: (previous) => previous,
  })
}

export function fetchPeriods(workspaceId: string, year: number | undefined) {
  return unwrap(workspaceApi.periods.$get({ param: { workspaceId }, query: year ? { year } : {} }))
}

export function fetchAccounts(workspaceId: string) {
  return unwrap(workspaceApi.accounts.$get({ param: { workspaceId } }))
}

export function fetchOccurrences(workspaceId: string, from: IsoDate, to: IsoDate) {
  return unwrap(workspaceApi.occurrences.$get({ param: { workspaceId }, query: { from, to } }))
}
