import type { IsoDate } from '@shared/core/calendar/calendar.types'
import { addDays } from '@shared/core/calendar/dates'
import { plannedDatesBetween } from '@shared/planning/recurrence/recurrence'
import type {
  DateRange,
  HolidayEffect,
  HolidayRecurrence,
} from '@shared/planning/recurrence/recurrence.types'

const DAYS_AROUND_A_HOLIDAY = 45

export function holidayEffects(
  recurrences: readonly HolidayRecurrence[],
  holiday: IsoDate,
  holidays: ReadonlySet<IsoDate>,
): HolidayEffect[] {
  const window = {
    from: addDays(holiday, -DAYS_AROUND_A_HOLIDAY),
    to: addDays(holiday, DAYS_AROUND_A_HOLIDAY),
  }
  const withoutIt = new Set([...holidays].filter((date) => date !== holiday))
  const withIt = new Set([...holidays, holiday])
  return recurrences.flatMap(({ recurrenceId, description, schedule }) =>
    movedDates(dueDates(schedule, window, withoutIt), dueDates(schedule, window, withIt)).map(
      ([fromOn, toOn]) => ({ recurrenceId, description, fromOn, toOn }),
    ),
  )
}

function dueDates(
  schedule: HolidayRecurrence['schedule'],
  window: DateRange,
  holidays: ReadonlySet<IsoDate>,
): IsoDate[] {
  return plannedDatesBetween(schedule, window, holidays).map((planned) => planned.dueOn)
}

function movedDates(before: readonly IsoDate[], after: readonly IsoDate[]): [IsoDate, IsoDate][] {
  const lost = before.filter((date) => !after.includes(date))
  const gained = after.filter((date) => !before.includes(date))
  return lost.flatMap((fromOn, index) => {
    const toOn = gained[index]
    return toOn === undefined ? [] : [[fromOn, toOn] as [IsoDate, IsoDate]]
  })
}
