import type { IsoDate } from '@financas/shared'
import type { HolidayStatus } from '@web/components/finance/holiday-row'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  HolidayLists,
  HolidaySummary,
  HolidaysOfYear,
} from '@web/features/settings/settings.types'
import { formatShortDate } from '@web/lib/format/calendar'

const row = settingsMessages.holidaysRow
const names = settingsMessages.nationalNames

export function holidayListsOf(holidays: HolidaysOfYear, today: IsoDate): HolidayLists {
  const nextOn = holidays.summary.next?.onDate ?? null
  const statusOf = (onDate: IsoDate): HolidayStatus => {
    if (onDate < today) {
      return 'past'
    }
    return onDate === nextOn ? 'next' : 'upcoming'
  }
  return {
    workspace: [...holidays.workspace]
      .sort((left, right) => left.onDate.localeCompare(right.onDate))
      .map((holiday) => ({
        key: holiday.id,
        holidayId: holiday.id,
        onDate: holiday.onDate,
        name: holiday.name,
        status: statusOf(holiday.onDate),
      })),
    national: holidays.national.map((holiday) => ({
      key: holiday.key,
      holidayId: null,
      onDate: holiday.on,
      name: names[holiday.key],
      status: statusOf(holiday.on),
    })),
  }
}

export function holidaySummaryText(summary: HolidaySummary, year: number): string {
  const total = row.summary(summary.total, year)
  const next = summary.next
  if (!next) {
    return total
  }
  const name = next.name ?? (next.nationalKey ? names[next.nationalKey] : '')
  return row.next(total, name, formatShortDate(next.onDate))
}
