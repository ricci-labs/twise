import type { IsoDate } from '@financas/shared'

export type NextHolidayEffect = {
  description: string
  toOn: IsoDate
}

export type NextHoliday = {
  onDate: IsoDate
  name: string
  daysAway: number
  effects: readonly NextHolidayEffect[]
}

export type NextHolidayCardProps = {
  holiday: NextHoliday | null
}

export type NextHolidayDetailsProps = {
  holiday: NextHoliday
}
