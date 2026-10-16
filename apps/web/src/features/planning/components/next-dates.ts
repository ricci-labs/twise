import {
  APPROXIMATE_DAYS_PER_STEP,
  addDays,
  DAYS_A_DUE_DATE_MAY_SHIFT,
  type DateRange,
  dayOfWeek,
  holidayDatesBetween,
  type IsoDate,
  type PlannedDate,
  parseIsoDate,
  plannedDatesBetween,
  type RecurrenceSchedule,
  toIsoDate,
} from '@financas/shared'
import type { NextDate } from '@web/components/finance/next-dates-preview'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { RecurrenceAmount } from '@web/features/planning/planning.types'
import { formatShortDate, formatShortWeekday } from '@web/lib/format/calendar'

const notes = planningMessages.form.preview
const weekdays = planningMessages.recurrences.weekdays

const PREVIEW_SIZE = 3

const PREVIEW_MARGIN_DAYS = 45

export function plannedPreviewOf(
  schedule: RecurrenceSchedule,
  today: IsoDate,
  workspaceHolidays: readonly IsoDate[] = [],
): PlannedDate[] {
  const range = previewRangeOf(schedule, today)
  const holidayRange = holidayRangeOf(range)
  const holidays = holidayDatesBetween(holidayRange.from, holidayRange.to, workspaceHolidays)
  return plannedDatesBetween(schedule, range, holidays).slice(0, PREVIEW_SIZE)
}

export function yearsOf(dates: readonly PlannedDate[]): number[] {
  return [...new Set(dates.map((date) => parseIsoDate(date.dueOn).year))]
}

export function nextDatesOf(
  planned: readonly PlannedDate[],
  schedule: RecurrenceSchedule,
  amount: RecurrenceAmount,
): NextDate[] {
  return planned.slice(0, PREVIEW_SIZE).map((date) => ({
    key: date.dueOn,
    date: formatShortDate(date.dueOn),
    weekday: formatShortWeekday(date.dueOn),
    amountCents: amount.amountCents,
    isEstimate: amount.isEstimate,
    note: noteOf(date, schedule.nthBusinessDay),
  }))
}

function previewRangeOf(schedule: RecurrenceSchedule, today: IsoDate): DateRange {
  const from = schedule.startsOn > today ? schedule.startsOn : today
  const stepDays = APPROXIMATE_DAYS_PER_STEP[schedule.frequency] * schedule.interval
  return { from, to: addDays(from, PREVIEW_SIZE * stepDays + PREVIEW_MARGIN_DAYS) }
}

function holidayRangeOf({ from, to }: DateRange): DateRange {
  const { year, month } = parseIsoDate(from)
  return {
    from: addDays(toIsoDate(year, month, 1), -DAYS_A_DUE_DATE_MAY_SHIFT),
    to: addDays(to, DAYS_A_DUE_DATE_MAY_SHIFT),
  }
}

function noteOf(date: PlannedDate, nthBusinessDay: number | null): string | undefined {
  if (nthBusinessDay !== null) {
    return date.isAfterHoliday
      ? notes.afterHoliday(nthBusinessDay)
      : notes.businessDay(nthBusinessDay)
  }
  const nominalDay = parseIsoDate(date.nominalOn).day
  if (date.movedBy === 'holiday') {
    return notes.holiday(nominalDay, weekdayOf(date.dueOn))
  }
  if (date.movedBy === 'weekend') {
    return notes.weekend(nominalDay, weekdayOf(date.nominalOn), weekdayOf(date.dueOn))
  }
  return undefined
}

function weekdayOf(date: IsoDate): string {
  return weekdays[dayOfWeek(date)] ?? ''
}
