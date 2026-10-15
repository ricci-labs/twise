const DIACRITICS = /\p{Diacritic}/gu

export const SHORT_LIST_SIZE = 5

export const LIST_SEARCH_ABOVE = 10

export const GRID_SEARCH_ABOVE = 12

export function matchesSearch(text: string, search: string): boolean {
  return foldedForSearch(text).includes(foldedForSearch(search.trim()))
}

export function foldedForSearch(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS, '').toLocaleLowerCase('pt-BR')
}
