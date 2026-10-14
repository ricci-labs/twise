import type { LatestEntry } from '@web/features/entries/entries.types'

export function preferredAccountOf(
  usableAccountIds: readonly string[],
  latestEntries: readonly LatestEntry[],
): string | undefined {
  const lastUsed = latestEntries
    .filter((entry) => entry.entryType === 'expense')
    .flatMap((entry) => entry.postings.map((posting) => posting.accountId))
    .find((accountId) => usableAccountIds.includes(accountId))
  if (lastUsed) {
    return lastUsed
  }
  return usableAccountIds.length === 1 ? usableAccountIds[0] : undefined
}
