export type LongListOptions<Item> = {
  items: readonly Item[]
  isPinned: (item: Item) => boolean
  searchAbove?: number
  searchedCount?: number
  searchResults: (items: readonly Item[], search: string) => Item[]
  canShorten: boolean
}

export type LongListView<Item> = Pick<LongListOptions<Item>, 'searchResults'> & {
  isSearching: boolean
  isShort: boolean
}
