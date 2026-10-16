import { type IsoDate, toYearMonthLabel } from '@financas/shared'
import type { MiniMonthHoliday } from '@web/components/display/mini-month-calendar'
import type { HolidayStatus } from '@web/components/finance/holiday-row'
import type { NextHoliday } from '@web/components/finance/next-holiday-card'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  HolidayLists,
  HolidayMonth,
  HolidaySummary,
  HolidaysOfYear,
  UpcomingHoliday,
} from '@web/features/settings/settings.types'
import { formatShortDate } from '@web/lib/format/calendar'

const row = settingsMessages.holidaysRow
const names = settingsMessages.nationalNames
const MONTHS_IN_YEAR = 12

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
  return row.next(total, nextHolidayNameOf(next), formatShortDate(next.onDate))
}

export function nextHolidayOf(
  next: UpcomingHoliday,
  holidays: HolidaysOfYear | undefined,
): NextHoliday {
  return {
    onDate: next.onDate,
    name: nextHolidayNameOf(next),
    daysAway: next.daysAway,
    effects: affectsOn(holidays, next.onDate).map(({ description, toOn }) => ({
      description,
      toOn,
    })),
  }
}

export function monthsOf(holidays: HolidaysOfYear, year: number): HolidayMonth[] {
  const marked: MiniMonthHoliday[] = [
    ...holidays.national.map((holiday) => ({
      onDate: holiday.on,
      name: names[holiday.key],
      kind: 'national' as const,
    })),
    ...holidays.workspace.map((holiday) => ({
      onDate: holiday.onDate,
      name: holiday.name,
      kind: 'workspace' as const,
    })),
  ]
  return Array.from({ length: MONTHS_IN_YEAR }, (_, position) => {
    const month = toYearMonthLabel({ year, month: position + 1 })
    return { month, holidays: marked.filter((holiday) => holiday.onDate.startsWith(month)) }
  })
}

function nextHolidayNameOf(next: UpcomingHoliday): string {
  return next.name ?? (next.nationalKey ? names[next.nationalKey] : '')
}

function affectsOn(holidays: HolidaysOfYear | undefined, onDate: IsoDate) {
  const national = holidays?.national.find((holiday) => holiday.on === onDate)
  const workspace = holidays?.workspace.find((holiday) => holiday.onDate === onDate)
  return national?.affects ?? workspace?.affects ?? []
}
