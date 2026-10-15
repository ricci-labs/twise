import type { InvoiceLineFilter } from '@financas/shared'
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { InvoiceLinesState } from '@web/features/accounts/accounts.types'
import {
  accountsQueryOptions,
  invoiceLinesQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import { invoiceLinesOf } from '@web/features/accounts/components/card-invoices'

export function useInvoiceLines(
  workspaceId: string,
  cardId: string,
  invoiceId: string | null,
  filter: InvoiceLineFilter,
): InvoiceLinesState {
  const query = useInfiniteQuery({
    ...invoiceLinesQueryOptions(workspaceId, cardId, invoiceId ?? '', filter),
    enabled: invoiceId !== null,
    placeholderData: keepPreviousData,
  })
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const pages = query.data?.pages
  const items = pages?.flatMap((page) => page.items)
  return {
    lines: items && accounts.data ? invoiceLinesOf(items, accounts.data) : undefined,
    counts: pages?.[0]?.counts,
    lastPayment: pages?.[0]?.lastPayment ?? null,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
    error: query.error,
    isRetrying: query.isFetching,
    retry: () => void query.refetch(),
  }
}
