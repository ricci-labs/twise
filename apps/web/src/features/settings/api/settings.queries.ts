import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
const TODAY_FRESH_MS = 60 * 60 * 1000
const HOLIDAYS_FRESH_MS = 60 * 60 * 1000

export function todayQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'periods', 'current'] as const,
    queryFn: () => unwrap(workspaceApi.periods.$get({ param: { workspaceId }, query: {} })),
    staleTime: TODAY_FRESH_MS,
    select: (periods) => periods.today,
  })
}

export function workspaceSettingsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'settings'] as const,
    queryFn: () => fetchWorkspaceSettings(workspaceId),
  })
}

export function fetchWorkspaceSettings(workspaceId: string) {
  return unwrap(workspaceApi.settings.$get({ param: { workspaceId } }))
}

export function holidaysQueryOptions(workspaceId: string, year: number) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'holidays', year] as const,
    queryFn: () => fetchHolidays(workspaceId, year),
    staleTime: HOLIDAYS_FRESH_MS,
  })
}

export function fetchHolidays(workspaceId: string, year: number) {
  return unwrap(
    workspaceApi.holidays.$get({ param: { workspaceId }, query: { year: String(year) } }),
  )
}

export function chargeTextQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: chargeTextKey(workspaceId),
    queryFn: () => fetchChargeText(workspaceId),
  })
}

export function chargeTextKey(workspaceId: string) {
  return [...queryKeys.workspace(workspaceId), 'settings', 'charge-text'] as const
}

export function fetchChargeText(workspaceId: string) {
  return unwrap(workspaceApi.settings['charge-text'].$get({ param: { workspaceId } }))
}
