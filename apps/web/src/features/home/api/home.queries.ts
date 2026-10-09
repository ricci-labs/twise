import {
  DEMO_PERIOD_LABELS,
  DEMO_WORKSPACE_IDS,
  type DemoVariant,
  demoDirectory,
  demoOverviewFor,
  MONEY_ACCOUNT_KINDS,
} from '@financas/shared'
import { queryOptions } from '@tanstack/react-query'
import { unwrap } from '@web/lib/api/unwrap'
import { apiClient } from '@web/lib/api-client'
import { queryKeys } from '@web/lib/query-keys'

const workspaceApi = apiClient.api.workspaces[':workspaceId']
const DEMO_FOREVER = Number.POSITIVE_INFINITY

export function overviewQueryOptions(workspaceId: string, period: string | undefined) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'overview', period ?? 'current'] as const,
    queryFn: () => fetchOverview(workspaceId, period),
    placeholderData: (previous) => previous,
    ...demoFreshness(workspaceId),
  })
}

export function accountsQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'accounts'] as const,
    queryFn: () => fetchAccounts(workspaceId),
    ...demoFreshness(workspaceId),
  })
}

export function accountNamesQueryOptions(workspaceId: string) {
  return queryOptions({
    ...accountsQueryOptions(workspaceId),
    select: (accounts) => new Map(accounts.map((account) => [account.id, account.name])),
  })
}

export function setupQueryOptions(workspaceId: string) {
  return queryOptions({
    ...accountsQueryOptions(workspaceId),
    select: (accounts) => {
      const kinds = new Set(
        accounts.filter((account) => !account.isSystem).map((account) => account.kind),
      )
      return {
        hasMoneyAccount: MONEY_ACCOUNT_KINDS.some((kind) => kinds.has(kind)),
        hasCard: kinds.has('credit_card'),
      }
    },
  })
}

export function contactNamesQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: [...queryKeys.workspace(workspaceId), 'contacts'] as const,
    queryFn: () => fetchContacts(workspaceId),
    select: (contacts) => new Map(contacts.map((contact) => [contact.id, contact.name])),
    ...demoFreshness(workspaceId),
  })
}

export function fetchOverview(workspaceId: string, period: string | undefined) {
  const variant = demoVariantOf(workspaceId)
  if (variant) {
    return Promise.resolve(demoOverviewFor(period ?? DEMO_PERIOD_LABELS.current, variant))
  }
  return unwrap(
    workspaceApi.overview.$get({ param: { workspaceId }, query: period ? { period } : {} }),
  )
}

function fetchAccounts(workspaceId: string) {
  if (demoVariantOf(workspaceId)) {
    return Promise.resolve(
      demoDirectory().accounts.map((account, sortOrder) => ({
        ...account,
        currency: 'BRL',
        ownerUserId: null,
        isSystem: false,
        sortOrder,
        color: null,
        icon: null,
        archivedAt: null,
      })),
    )
  }
  return unwrap(workspaceApi.accounts.$get({ param: { workspaceId } }))
}

function fetchContacts(workspaceId: string) {
  if (demoVariantOf(workspaceId)) {
    return Promise.resolve(
      demoDirectory().contacts.map((contact) => ({
        ...contact,
        phoneE164: null,
        pixKey: null,
        notes: null,
        isOptedOut: false,
        isArchived: false,
      })),
    )
  }
  return unwrap(workspaceApi.contacts.$get({ param: { workspaceId } }))
}

function demoFreshness(workspaceId: string) {
  return demoVariantOf(workspaceId) ? { staleTime: DEMO_FOREVER } : {}
}

function demoVariantOf(workspaceId: string): DemoVariant | undefined {
  const entry = Object.entries(DEMO_WORKSPACE_IDS).find(([, id]) => id === workspaceId)
  return entry?.[0] as DemoVariant | undefined
}
