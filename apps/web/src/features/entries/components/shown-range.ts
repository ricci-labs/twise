import {
  addDays,
  ENTRY_SEARCH_MIN_LENGTH,
  type EntryFilter,
  type IsoDate,
  type PeriodsOfYear,
  parseIsoDate,
  toIsoDate,
} from '@financas/shared'
import type { PeriodPreset } from '@web/components/navigation/period-picker'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntriesListSearch, ShownRange } from '@web/features/entries/entries.types'
import { formatMonthLabel, formatRange } from '@web/lib/format/calendar'

const messages = entriesMessages.list
const LAST_30_DAYS_BACK = -29
const DECEMBER = 12
const LAST_DAY_OF_DECEMBER = 31

export function shownLabelOf(search: EntriesListSearch, periods: PeriodsOfYear): string {
  return search.period ?? periods.currentLabel
}

export function shownRangeOf(
  search: EntriesListSearch,
  periods: PeriodsOfYear,
): ShownRange | undefined {
  if (search.from && search.to) {
    const range = formatRange(search.from, search.to)
    return search.preset
      ? {
          kind: 'range',
          from: search.from,
          to: search.to,
          title: messages.presets[search.preset],
          detail: range,
        }
      : { kind: 'range', from: search.from, to: search.to, title: range }
  }
  const label = shownLabelOf(search, periods)
  const period = periods.periods.find((candidate) => candidate.label === label)
  return (
    period && {
      kind: 'period',
      period,
      title: formatMonthLabel(label),
      detail: formatRange(period.start, period.end),
    }
  )
}

export function searchTextOf(search: EntriesListSearch): string | undefined {
  const text = search.q?.trim() ?? ''
  return text.length >= ENTRY_SEARCH_MIN_LENGTH ? text : undefined
}

export function listFilterOf(search: EntriesListSearch, shown: ShownRange): EntryFilter {
  const q = searchTextOf(search)
  const isEverywhere = q !== undefined && search.everywhere === true
  const { from, to } =
    shown.kind === 'period' ? { from: shown.period.start, to: shown.period.end } : shown
  return {
    ...(isEverywhere ? {} : { from, to }),
    q,
    types: search.types,
    accountId: search.accountId,
    categoryId: search.categoryId,
    spentByUserId: search.spentBy,
    shared: search.shared,
  }
}

export function hasFiltersIn(search: EntriesListSearch): boolean {
  return Boolean(
    search.types?.length ||
      search.accountId ||
      search.categoryId ||
      search.spentBy ||
      search.shared,
  )
}

export function presetRangeOf(
  preset: PeriodPreset,
  today: IsoDate,
): { from: IsoDate; to: IsoDate } {
  if (preset === 'last30Days') {
    return { from: addDays(today, LAST_30_DAYS_BACK), to: today }
  }
  const { year } = parseIsoDate(today)
  return { from: toIsoDate(year, 1, 1), to: toIsoDate(year, DECEMBER, LAST_DAY_OF_DECEMBER) }
}
