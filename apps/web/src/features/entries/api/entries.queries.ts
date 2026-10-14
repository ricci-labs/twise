import { type EntryTypeWithCategory, FREQUENT_ENTRIES_MAX_LIMIT } from '@financas/shared'
import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
const LATEST_ENTRIES_LIMIT = '50'
const SUGGESTIONS_FRESH_MS = 60_000

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
