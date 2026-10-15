import { addDays, type IsoDate } from '@financas/shared'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntryDay, ListedEntry } from '@web/features/entries/entries.types'
import { formatWeekdayDayMonth } from '@web/lib/format/calendar'

const messages = entriesMessages.list

export function entryDaysOf(entries: readonly ListedEntry[], today: IsoDate): EntryDay[] {
  const days = new Map<IsoDate, ListedEntry[]>()
  for (const entry of entries) {
    const date = entry.occurredOn as IsoDate
    days.set(date, [...(days.get(date) ?? []), entry])
  }
  return [...days].map(([date, dayEntries]) => ({
    date,
    ...titleOf(date, today),
    entries: dayEntries,
  }))
}

function titleOf(date: IsoDate, today: IsoDate): Pick<EntryDay, 'title' | 'detail'> {
  const words = formatWeekdayDayMonth(date)
  if (date === today) {
    return { title: messages.today, detail: words }
  }
  if (date === addDays(today, -1)) {
    return { title: messages.yesterday, detail: words }
  }
  return { title: words }
}
