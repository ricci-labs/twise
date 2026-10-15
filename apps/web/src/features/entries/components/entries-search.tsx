import { SearchInput } from '@web/components/inputs/search-input'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntriesSearchProps } from '@web/features/entries/entries.types'
import { useEffect, useState } from 'react'

const messages = entriesMessages.list
const SEARCH_DELAY_MS = 300

export function EntriesSearch({ search, onSearchChange }: EntriesSearchProps) {
  const [text, setText] = useState(search.q ?? '')
  const [shownQuery, setShownQuery] = useState(search.q)
  if (shownQuery !== search.q) {
    setShownQuery(search.q)
    setText(search.q ?? '')
  }
  useEffect(() => {
    if (text === (search.q ?? '')) {
      return
    }
    const timer = setTimeout(() => {
      onSearchChange({ q: text === '' ? undefined : text, everywhere: undefined })
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [text, search.q, onSearchChange])
  return (
    <SearchInput label={messages.search} className="flex-1" value={text} onValueChange={setText} />
  )
}
