import { MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

const EVERY_FUTURE_ITEM = '9999-12-31'
const UPCOMING_LIMIT = 5
const RECEIPTS_LIMIT = 5
const SETTLEMENT = 'settlement' as const

export function contactsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'list'] as const,
    queryFn: () => fetchContacts(workspaceId),
  })
}

export function contactBalancesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'balances'] as const,
    queryFn: () => fetchContactBalances(workspaceId),
  })
}

export function fetchContacts(workspaceId: string) {
  return unwrap(workspaceApi.contacts.$get({ param: { workspaceId } }))
}

export function fetchContactBalances(workspaceId: string) {
  return unwrap(workspaceApi.contacts.balances.$get({ param: { workspaceId } }))
}

export function contactQueryOptions(workspaceId: string, contactId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'one', contactId] as const,
    queryFn: () => fetchContact(workspaceId, contactId),
  })
}

export function contactOpenItemsQueryOptions(workspaceId: string, contactId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'open-items', contactId] as const,
    queryFn: () => fetchContactOpenItems(workspaceId, contactId),
  })
}

export function fetchContactOpenItems(workspaceId: string, contactId: string) {
  return unwrap(
    workspaceApi.contacts[':contactId']['open-items'].$get({
      param: { workspaceId, contactId },
      query: { until: EVERY_FUTURE_ITEM, includeCharged: 'true' },
    }),
  )
}

export function contactChargesQueryOptions(workspaceId: string, contactId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'charges', contactId] as const,
    queryFn: () => fetchContactCharges(workspaceId, contactId),
  })
}

export function fetchContactCharges(workspaceId: string, contactId: string) {
  return unwrap(workspaceApi.charges.$get({ param: { workspaceId }, query: { contactId } }))
}

export function moneyAccountsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts'] as const,
    queryFn: () => unwrap(workspaceApi.accounts.$get({ param: { workspaceId } })),
    select: (accounts) =>
      accounts.filter(
        (account) =>
          account.archivedAt === null &&
          (MONEY_ACCOUNT_KINDS as readonly string[]).includes(account.kind),
      ),
  })
}

export function accountBalancesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'balances'] as const,
    queryFn: () => unwrap(workspaceApi.balances.$get({ param: { workspaceId } })),
  })
}

export function chargeTextQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'settings', 'charge-text'] as const,
    queryFn: () => unwrap(workspaceApi.settings['charge-text'].$get({ param: { workspaceId } })),
  })
}

export function upcomingContactItemsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'upcoming'] as const,
    queryFn: () => fetchUpcomingContactItems(workspaceId),
  })
}

export function fetchUpcomingContactItems(workspaceId: string) {
  return unwrap(
    workspaceApi.contacts.upcoming.$get({
      param: { workspaceId },
      query: { limit: String(UPCOMING_LIMIT) },
    }),
  )
}

export function contactReceiptsQueryOptions(workspaceId: string, contactId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'entries', 'contact', contactId] as const,
    queryFn: () => fetchContactReceipts(workspaceId, contactId),
    select: (page) => page.items,
  })
}

export function fetchContactReceipts(workspaceId: string, contactId: string) {
  return unwrap(
    workspaceApi.entries.$get({
      param: { workspaceId },
      query: { contactId, types: [SETTLEMENT], limit: String(RECEIPTS_LIMIT) },
    }),
  )
}

export function pixReceiverQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'settings'] as const,
    queryFn: () => unwrap(workspaceApi.settings.$get({ param: { workspaceId } })),
    select: (settings) => ({
      key: settings.pixReceivingKey,
      name: settings.pixReceiverName,
      city: settings.pixReceiverCity,
    }),
  })
}

export function chargeQueryOptions(workspaceId: string, chargeId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts', 'charge', chargeId] as const,
    queryFn: () =>
      unwrap(workspaceApi.charges[':chargeId'].$get({ param: { workspaceId, chargeId } })),
  })
}

export function fetchContact(workspaceId: string, contactId: string) {
  return unwrap(workspaceApi.contacts[':contactId'].$get({ param: { workspaceId, contactId } }))
}
