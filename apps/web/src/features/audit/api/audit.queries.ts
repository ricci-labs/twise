import type { AuditQuery } from '@financas/shared'
import { infiniteQueryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
type AuditPageQuery = Parameters<typeof workspaceApi.audit.$get>[0]['query']
const PAGE_SIZE = '50'
const NO_CURSOR: string | undefined = undefined

export function auditQueryOptions(
  workspaceId: string,
  filter: Pick<AuditQuery, 'area' | 'actorId' | 'rowId'>,
) {
  return infiniteQueryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'audit', filter] as const,
    queryFn: ({ pageParam }) => fetchAuditPage(workspaceId, filter, pageParam),
    initialPageParam: NO_CURSOR,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  })
}

export function fetchAuditPage(
  workspaceId: string,
  filter: Pick<AuditQuery, 'area' | 'actorId' | 'rowId'>,
  cursor: string | undefined,
) {
  return unwrap(
    workspaceApi.audit.$get({
      param: { workspaceId },
      query: { ...filter, limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) } as AuditPageQuery,
    }),
  )
}
