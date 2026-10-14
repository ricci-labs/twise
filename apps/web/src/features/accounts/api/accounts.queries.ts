import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

const UPCOMING_INVOICES = 6

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

export function upcomingInvoicesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'cards', 'upcoming-invoices'] as const,
    queryFn: () => fetchUpcomingInvoices(workspaceId),
  })
}

export function invoicesQueryOptions(workspaceId: string, cardId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'cards', cardId, 'invoices'] as const,
    queryFn: () => fetchInvoices(workspaceId, cardId),
  })
}

export function invoiceLinesQueryOptions(workspaceId: string, cardId: string, invoiceId: string) {
  return queryOptions({
    queryKey: [
      ...queryKeys.workspace(workspaceId),
      'cards',
      cardId,
      'invoices',
      invoiceId,
    ] as const,
    queryFn: () => fetchInvoiceLines(workspaceId, cardId, invoiceId),
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

export function fetchUpcomingInvoices(workspaceId: string) {
  return unwrap(
    workspaceApi.cards.invoices.upcoming.$get({
      param: { workspaceId },
      query: { limit: String(UPCOMING_INVOICES) },
    }),
  )
}

export function fetchMembers(workspaceId: string) {
  return unwrap(workspaceApi.members.$get({ param: { workspaceId } }))
}

export function fetchInvoices(workspaceId: string, cardId: string) {
  return unwrap(workspaceApi.cards[':cardId'].invoices.$get({ param: { workspaceId, cardId } }))
}

export function fetchInvoiceLines(workspaceId: string, cardId: string, invoiceId: string) {
  return unwrap(
    workspaceApi.cards[':cardId'].invoices[':invoiceId'].lines.$get({
      param: { workspaceId, cardId, invoiceId },
    }),
  )
}
