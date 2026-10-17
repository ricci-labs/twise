import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']

const EVERY_FUTURE_ITEM = '9999-12-31'

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

export function chargeTextQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'settings', 'charge-text'] as const,
    queryFn: () => unwrap(workspaceApi.settings['charge-text'].$get({ param: { workspaceId } })),
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
