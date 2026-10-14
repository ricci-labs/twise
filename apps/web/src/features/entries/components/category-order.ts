import type { LatestEntry, LedgerAccount } from '@web/features/entries/entries.types'

export function byMostUsed(
  categories: readonly LedgerAccount[],
  latestEntries: readonly LatestEntry[],
): LedgerAccount[] {
  const uses = usesOfTopCategories(categories, latestEntries)
  return [...categories].sort((first, second) => usesOf(uses, second) - usesOf(uses, first))
}

function usesOfTopCategories(
  categories: readonly LedgerAccount[],
  latestEntries: readonly LatestEntry[],
): Map<string, number> {
  const topOf = new Map(
    categories.map((category) => [category.id, category.parentId ?? category.id]),
  )
  const uses = new Map<string, number>()
  for (const posting of latestEntries.flatMap((entry) => entry.postings)) {
    const top = topOf.get(posting.accountId)
    if (top) {
      uses.set(top, (uses.get(top) ?? 0) + 1)
    }
  }
  return uses
}

function usesOf(uses: Map<string, number>, category: LedgerAccount): number {
  return uses.get(category.parentId ?? category.id) ?? 0
}
