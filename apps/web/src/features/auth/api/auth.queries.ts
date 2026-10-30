import { addDays, type IsoDate } from '@financas/shared'
import { type QueryClient, queryOptions } from '@tanstack/react-query'
import { ApiError, isSessionRequired, NetworkError } from '@web/lib/api/api-error'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const MAX_SESSION_RETRIES = 2
const EXAMPLE_DAYS = 60
const workspaceApi = apiClient.api.workspaces[':workspaceId']

export function meQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.me,
    queryFn: () => unwrap(apiClient.api.auth.me.$get()),
    networkMode: 'always',
    retry: (failureCount, error) =>
      error instanceof ApiError && error.isServerError && failureCount < MAX_SESSION_RETRIES,
  })
}

export function authConfigQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.authConfig,
    queryFn: () => unwrap(apiClient.api.auth.config.$get()),
  })
}

export async function loadSession(queryClient: QueryClient) {
  try {
    return await queryClient.ensureQueryData(meQueryOptions())
  } catch (error) {
    if (isSessionRequired(error) || error instanceof NetworkError) {
      return null
    }
    throw error
  }
}

export function hadSession(queryClient: QueryClient): boolean {
  return queryClient.getQueryData(meQueryOptions().queryKey) !== undefined
}

export function userPreferencesQueryOptions() {
  return queryOptions({
    queryKey: [...queryKeys.me, 'preferences'] as const,
    queryFn: () => unwrap(apiClient.api.auth.me.preferences.$get()),
  })
}

export function memberPreferencesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'my-preferences'] as const,
    queryFn: () => unwrap(workspaceApi.members.me.preferences.$get({ param: { workspaceId } })),
  })
}

export function upcomingBillsQueryOptions(workspaceId: string, today: IsoDate) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'occurrences', 'example', today] as const,
    queryFn: () =>
      unwrap(
        workspaceApi.occurrences.$get({
          param: { workspaceId },
          query: { from: today, to: addDays(today, EXAMPLE_DAYS) },
        }),
      ),
  })
}
