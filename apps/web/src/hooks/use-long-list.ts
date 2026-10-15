import type { LongListOptions, LongListView } from '@web/hooks/use-long-list.types'
import { SHORT_LIST_SIZE } from '@web/lib/long-lists'
import { useCallback, useRef, useState } from 'react'

export function useLongList<Item>({
  items,
  isPinned,
  searchAbove,
  searchedCount = items.length,
  searchResults,
  canShorten,
}: LongListOptions<Item>) {
  const [search, setSearch] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldFocusRevealed = useRef(false)
  const hasSearch = searchAbove !== undefined && searchedCount > searchAbove
  const isSearching = hasSearch && search.trim() !== ''
  const isShort =
    canShorten && !isSearching && !isExpanded && !items.slice(SHORT_LIST_SIZE).some(isPinned)

  const showAll = () => {
    shouldFocusRevealed.current = true
    setIsExpanded(true)
  }

  const firstRevealedRef = useCallback((element: HTMLElement | null) => {
    if (element && shouldFocusRevealed.current) {
      shouldFocusRevealed.current = false
      element.focus()
    }
  }, [])

  return {
    search,
    setSearch,
    hasSearch,
    isSearching,
    shown: shownItems(items, search, { isSearching, isShort, searchResults }),
    hiddenCount: isShort ? Math.max(0, items.length - SHORT_LIST_SIZE) : 0,
    showAll,
    refAt: (position: number) => (position === SHORT_LIST_SIZE ? firstRevealedRef : undefined),
  }
}

function shownItems<Item>(
  items: readonly Item[],
  search: string,
  view: LongListView<Item>,
): readonly Item[] {
  if (view.isSearching) {
    return view.searchResults(items, search)
  }
  return view.isShort ? items.slice(0, SHORT_LIST_SIZE) : items
}
