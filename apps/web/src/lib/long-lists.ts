import type { TextPart } from '@web/lib/long-lists.types'

const DIACRITICS = /\p{Diacritic}/gu

export const SHORT_LIST_SIZE = 5

export const LIST_SEARCH_ABOVE = 10

export const CATEGORIES_SEARCH_ABOVE = 12

export function matchesSearch(text: string, search: string): boolean {
  return foldedForSearch(text).includes(foldedForSearch(search.trim()))
}

export function foldedForSearch(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS, '').toLocaleLowerCase('pt-BR')
}

export function partsMatching(text: string, search: string): TextPart[] {
  const wanted = foldedForSearch(search.trim())
  const folded = [...text].map(foldedForSearch)
  const start = wanted === '' ? -1 : folded.join('').indexOf(wanted)
  if (start < 0) {
    return [{ text, isMatch: false }]
  }
  const characters = [...text]
  const startAt = characterAt(folded, start)
  const endAt = characterAt(folded, start + wanted.length)
  return [
    { text: characters.slice(0, startAt).join(''), isMatch: false },
    { text: characters.slice(startAt, endAt).join(''), isMatch: true },
    { text: characters.slice(endAt).join(''), isMatch: false },
  ].filter((part) => part.text !== '')
}

function characterAt(folded: readonly string[], foldedIndex: number): number {
  let length = 0
  for (const [index, piece] of folded.entries()) {
    if (length >= foldedIndex) {
      return index
    }
    length += piece.length
  }
  return folded.length
}
