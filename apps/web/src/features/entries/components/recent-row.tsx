import { useQuery } from '@tanstack/react-query'
import { RecentEntries } from '@web/components/finance/recent-entries'
import {
  accountsQueryOptions,
  frequentEntriesQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { categoryTypeOf } from '@web/features/entries/components/entry-kind'
import type { RecentRowProps } from '@web/features/entries/entries.types'

export function RecentRow({ workspaceId, entryType, autoFill }: RecentRowProps) {
  const type = categoryTypeOf(entryType)
  const frequent =
    useQuery({
      ...frequentEntriesQueryOptions(workspaceId, type ?? 'expense'),
      enabled: type !== undefined,
    }).data ?? []
  const iconOf = new Map(
    (useQuery(accountsQueryOptions(workspaceId)).data ?? []).map((account) => [
      account.id,
      account.icon,
    ]),
  )
  if (!type) {
    return null
  }
  return (
    <RecentEntries
      entries={frequent.map((entry) => ({
        key: entry.description,
        description: entry.description,
        icon: entry.categoryId ? (iconOf.get(entry.categoryId) ?? null) : null,
        amountCents: entry.lastAmountCents,
      }))}
      pickedKey={autoFill.autoFill?.pickedKey ?? null}
      onPick={(key) => {
        const entry = frequent.find((item) => item.description === key)
        if (entry) {
          autoFill.repeatRecent(entry)
        }
      }}
    />
  )
}
