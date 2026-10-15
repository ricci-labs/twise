import {
  ENTRIES_PAGE_SIZE,
  type EntryFilter,
  type EntryTypeWithCategory,
  FREQUENT_ENTRIES_MAX_LIMIT,
} from '@financas/shared'
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
type EntriesPageQuery = Parameters<typeof workspaceApi.entries.$get>[0]['query']
type TrashPageQuery = Parameters<typeof workspaceApi.entries.trash.$get>[0]['query']
const LATEST_ENTRIES_LIMIT = '50'
const SUGGESTIONS_FRESH_MS = 60_000
const PERIODS_FRESH_MS = 60 * 60 * 1000
const LIST_PAGE_SIZE = String(ENTRIES_PAGE_SIZE)
const NO_CURSOR: string | undefined = undefined

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

export function cardInvoicesQueryOptions(workspaceId: string, cardId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'cards', cardId, 'invoices'] as const,
    queryFn: () => fetchCardInvoices(workspaceId, cardId),
    enabled: cardId !== '',
  })
}

export function entrySuggestionsQueryOptions(
  workspaceId: string,
  type: EntryTypeWithCategory,
  search: string,
) {
  return queryOptions({
    queryKey: [
      ...queryKeys.workspace(workspaceId),
      'entries',
      'suggestions',
      type,
      search,
    ] as const,
    queryFn: () => fetchEntrySuggestions(workspaceId, type, search),
    enabled: search.trim() !== '',
    staleTime: SUGGESTIONS_FRESH_MS,
  })
}

export function frequentEntriesQueryOptions(workspaceId: string, type: EntryTypeWithCategory) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'frequent', type] as const,
    queryFn: () => fetchFrequentEntries(workspaceId, type),
  })
}

export function contactBalancesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'balances'] as const,
    queryFn: () => fetchContactBalances(workspaceId),
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

export function entriesListQueryOptions(workspaceId: string, filter: EntryFilter) {
  return infiniteQueryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'list', filter] as const,
    queryFn: ({ pageParam }) => fetchEntriesPage(workspaceId, filter, pageParam),
    initialPageParam: NO_CURSOR,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  })
}

export function entrySummaryQueryOptions(workspaceId: string, filter: EntryFilter) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'summary', filter] as const,
    queryFn: () =>
      unwrap(workspaceApi.entries.summary.$get({ param: { workspaceId }, query: queryOf(filter) })),
  })
}

export function periodsQueryOptions(workspaceId: string, year: number | undefined) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'periods', year ?? 'current'] as const,
    queryFn: () =>
      unwrap(workspaceApi.periods.$get({ param: { workspaceId }, query: year ? { year } : {} })),
    staleTime: PERIODS_FRESH_MS,
  })
}

export function trashedEntriesQueryOptions(workspaceId: string) {
  return infiniteQueryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'trash'] as const,
    queryFn: ({ pageParam }) => fetchTrashPage(workspaceId, pageParam),
    initialPageParam: NO_CURSOR,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  })
}

export function entryQueryOptions(workspaceId: string, entryId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'one', entryId] as const,
    queryFn: () =>
      unwrap(workspaceApi.entries[':entryId'].$get({ param: { workspaceId, entryId } })),
  })
}

export function matchedOccurrenceQueryOptions(workspaceId: string, entryId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'occurrences', 'matched', entryId] as const,
    queryFn: () =>
      unwrap(workspaceApi.occurrences.matched.$get({ param: { workspaceId }, query: { entryId } })),
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

export function fetchCardInvoices(workspaceId: string, cardId: string) {
  return unwrap(workspaceApi.cards[':cardId'].invoices.$get({ param: { workspaceId, cardId } }))
}

export function fetchEntrySuggestions(
  workspaceId: string,
  type: EntryTypeWithCategory,
  search: string,
) {
  return unwrap(
    workspaceApi.entries.suggestions.$get({ param: { workspaceId }, query: { type, q: search } }),
  )
}

export function fetchFrequentEntries(workspaceId: string, type: EntryTypeWithCategory) {
  return unwrap(
    workspaceApi.entries.frequent.$get({
      param: { workspaceId },
      query: { type, limit: String(FREQUENT_ENTRIES_MAX_LIMIT) },
    }),
  )
}

export function fetchContactBalances(workspaceId: string) {
  return unwrap(workspaceApi.contacts.balances.$get({ param: { workspaceId } }))
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

export function fetchEntriesPage(
  workspaceId: string,
  filter: EntryFilter,
  cursor: string | undefined,
) {
  return unwrap(
    workspaceApi.entries.$get({
      param: { workspaceId },
      query: {
        ...queryOf(filter),
        limit: LIST_PAGE_SIZE,
        ...(cursor ? { cursor } : {}),
      } as EntriesPageQuery,
    }),
  )
}

function queryOf(filter: EntryFilter): Record<string, string> {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === false) {
      continue
    }
    query[key] = Array.isArray(value) ? value.join(',') : String(value)
  }
  return query
}

export function fetchTrashPage(workspaceId: string, cursor: string | undefined) {
  return unwrap(
    workspaceApi.entries.trash.$get({
      param: { workspaceId },
      query: { limit: LIST_PAGE_SIZE, ...(cursor ? { cursor } : {}) } as TrashPageQuery,
    }),
  )
}
