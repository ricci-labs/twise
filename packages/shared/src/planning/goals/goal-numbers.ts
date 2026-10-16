import type { IsoDate } from '@shared/core/calendar/calendar.types'
import { parseIsoDate } from '@shared/core/calendar/dates'
import type { GoalNumbers, GoalTarget } from '@shared/planning/goals/goals.types'
import { progressPercent } from '@shared/reports/metrics/facts'

const MONTHS_PER_YEAR = 12
const AT_LEAST_ONE_MONTH = 1

export function goalNumbers(
  { savedCents, targetCents, targetOn }: GoalTarget,
  today: IsoDate,
): GoalNumbers {
  const remainingCents = Math.max(targetCents - savedCents, 0)
  return {
    percent: progressPercent(Math.max(savedCents, 0), targetCents),
    remainingCents,
    overCents: Math.max(savedCents - targetCents, 0),
    monthlyToTargetCents:
      targetOn === null ? null : Math.ceil(remainingCents / monthsUntil(targetOn, today)),
  }
}

export function monthsUntil(targetOn: IsoDate, today: IsoDate): number {
  const target = parseIsoDate(targetOn)
  const now = parseIsoDate(today)
  const months = (target.year - now.year) * MONTHS_PER_YEAR + (target.month - now.month)
  return Math.max(months, AT_LEAST_ONE_MONTH)
}
