import type { IsoDate } from '@shared/core/calendar/calendar.types'

export type GoalTarget = {
  savedCents: number
  targetCents: number
  targetOn: IsoDate | null
}

export type GoalNumbers = {
  percent: number
  remainingCents: number
  overCents: number
  monthlyToTargetCents: number | null
}
