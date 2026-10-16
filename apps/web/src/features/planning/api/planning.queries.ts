import type { IsoDate } from '@financas/shared'
import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
const PERIODS_FRESH_MS = 60 * 60 * 1000
const HOLIDAYS_FRESH_MS = 60 * 60 * 1000

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

export function overviewQueryOptions(workspaceId: string, period: string | undefined) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'overview', period ?? 'current'] as const,
    queryFn: () => fetchOverview(workspaceId, period),
    placeholderData: (previous) => previous,
  })
}

export function balancesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'balances'] as const,
    queryFn: () => fetchBalances(workspaceId),
  })
}

export function holidaysQueryOptions(workspaceId: string, year: number) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'holidays', year] as const,
    queryFn: () => fetchHolidays(workspaceId, year),
    staleTime: HOLIDAYS_FRESH_MS,
  })
}

export function recurrencesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'recurrences'] as const,
    queryFn: () => fetchRecurrences(workspaceId),
  })
}

export function occurrencesQueryOptions(workspaceId: string, from: IsoDate, to: IsoDate) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'occurrences', from, to] as const,
    queryFn: () => fetchOccurrences(workspaceId, from, to),
    placeholderData: (previous) => previous,
  })
}

export function goalsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'goals'] as const,
    queryFn: () => fetchGoals(workspaceId),
  })
}

export function allocationStepsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'allocation-steps'] as const,
    queryFn: () => fetchAllocationSteps(workspaceId),
  })
}

export function candidatesQueryOptions(workspaceId: string, occurrenceId: string) {
  return queryOptions({
    queryKey: [
      ...queryKeys.workspace(workspaceId),
      'occurrences',
      occurrenceId,
      'candidates',
    ] as const,
    queryFn: () => fetchCandidates(workspaceId, occurrenceId),
  })
}

export function fetchPeriods(workspaceId: string, year: number | undefined) {
  return unwrap(workspaceApi.periods.$get({ param: { workspaceId }, query: year ? { year } : {} }))
}

export function fetchAccounts(workspaceId: string) {
  return unwrap(workspaceApi.accounts.$get({ param: { workspaceId } }))
}

export function fetchBalances(workspaceId: string) {
  return unwrap(workspaceApi.balances.$get({ param: { workspaceId } }))
}

export function fetchHolidays(workspaceId: string, year: number) {
  return unwrap(
    workspaceApi.holidays.$get({ param: { workspaceId }, query: { year: String(year) } }),
  )
}

export function fetchOccurrences(workspaceId: string, from: IsoDate, to: IsoDate) {
  return unwrap(workspaceApi.occurrences.$get({ param: { workspaceId }, query: { from, to } }))
}

export function fetchCandidates(workspaceId: string, occurrenceId: string) {
  return unwrap(
    workspaceApi.occurrences[':occurrenceId'].candidates.$get({
      param: { workspaceId, occurrenceId },
      query: {},
    }),
  )
}

export function fetchGoals(workspaceId: string) {
  return unwrap(workspaceApi.goals.$get({ param: { workspaceId } }))
}

export function fetchAllocationSteps(workspaceId: string) {
  return unwrap(workspaceApi['allocation-steps'].$get({ param: { workspaceId } }))
}

export function fetchRecurrences(workspaceId: string) {
  return unwrap(workspaceApi.recurrences.$get({ param: { workspaceId } }))
}

export function fetchOverview(workspaceId: string, period: string | undefined) {
  return unwrap(
    workspaceApi.overview.$get({ param: { workspaceId }, query: period ? { period } : {} }),
  )
}
