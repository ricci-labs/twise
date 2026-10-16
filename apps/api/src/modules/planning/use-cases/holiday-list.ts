import { systemClock } from '@api/core/clock'
import type { Clock } from '@api/core/clock.types'
import type { Database, WorkspaceTransaction } from '@api/core/db/db.types'
import { withWorkspace } from '@api/core/db/tx'
import { selectActiveRules, selectHolidaysBetween } from '@api/modules/planning/planning.repository'
import type {
  HolidaySummary,
  HolidaysOfYear,
  NextHoliday,
  WorkspaceHoliday,
} from '@api/modules/planning/planning.types'
import { holidayDatesOf } from '@api/modules/planning/use-cases/holidays'
import { scheduleOf, workspaceToday } from '@api/modules/planning/use-cases/occurrences'
import {
  addDays,
  daysBetween,
  type HolidayRecurrence,
  holidayEffects,
  type IsoDate,
  type NationalHoliday,
  nationalHolidays,
  parseIsoDate,
  toIsoDate,
} from '@financas/shared'

const DECEMBER = 12
const LAST_DAY_OF_DECEMBER = 31
const DAYS_AROUND_THE_YEAR = 60

export function listHolidays(
  db: Database,
  workspaceId: string,
  year: number,
  clock: Clock = systemClock,
): Promise<HolidaysOfYear> {
  return withWorkspace(db, workspaceId, async (tx) => {
    const today = await workspaceToday(tx, clock)
    const national = nationalHolidays(year)
    const workspace = await workspaceHolidaysOf(tx, year)
    const holidays = await holidayDatesOf(
      tx,
      addDays(toIsoDate(year, 1, 1), -DAYS_AROUND_THE_YEAR),
      addDays(toIsoDate(year, DECEMBER, LAST_DAY_OF_DECEMBER), DAYS_AROUND_THE_YEAR),
    )
    const recurrences = (await selectActiveRules(tx)).map(
      (rule): HolidayRecurrence => ({
        recurrenceId: rule.id,
        description: rule.description,
        schedule: scheduleOf(rule),
      }),
    )
    const affectsOn = (onDate: IsoDate) =>
      onDate < today ? [] : holidayEffects(recurrences, onDate, holidays)
    return {
      national: national.map((holiday) => ({ ...holiday, affects: affectsOn(holiday.on) })),
      workspace: workspace.map((holiday) => ({ ...holiday, affects: affectsOn(holiday.onDate) })),
      summary: await summaryOf(tx, { national, workspace }, today),
    }
  })
}

async function workspaceHolidaysOf(
  tx: WorkspaceTransaction,
  year: number,
): Promise<WorkspaceHoliday[]> {
  return selectHolidaysBetween(
    tx,
    toIsoDate(year, 1, 1),
    toIsoDate(year, DECEMBER, LAST_DAY_OF_DECEMBER),
  )
}

async function summaryOf(
  tx: WorkspaceTransaction,
  { national, workspace }: { national: NationalHoliday[]; workspace: WorkspaceHoliday[] },
  today: IsoDate,
): Promise<HolidaySummary> {
  return {
    total: national.length + workspace.length,
    national: national.length,
    workspace: workspace.length,
    next: await nextHoliday(tx, today),
  }
}

async function nextHoliday(tx: WorkspaceTransaction, today: IsoDate): Promise<NextHoliday | null> {
  const { year } = parseIsoDate(today)
  const upcoming: NextHoliday[] = []
  for (const candidateYear of [year, year + 1]) {
    for (const holiday of nationalHolidays(candidateYear)) {
      upcoming.push(nextOf(holiday.on, today, holiday.key, null))
    }
    for (const holiday of await workspaceHolidaysOf(tx, candidateYear)) {
      upcoming.push(nextOf(holiday.onDate, today, null, holiday.name))
    }
  }
  return (
    upcoming
      .filter((holiday) => holiday.onDate >= today)
      .sort((left, right) => left.onDate.localeCompare(right.onDate))[0] ?? null
  )
}

function nextOf(
  onDate: IsoDate,
  today: IsoDate,
  nationalKey: NationalHoliday['key'] | null,
  name: string | null,
): NextHoliday {
  return { onDate, daysAway: daysBetween(today, onDate), nationalKey, name }
}
