import type { IsoDate } from '@financas/shared'
import type { miniMonthDayVariants } from '@web/components/display/mini-month-calendar/mini-month-calendar.variants'
import type { VariantProps } from 'class-variance-authority'

export type MiniMonthHolidayKind = 'national' | 'workspace'

export type MiniMonthHoliday = {
  onDate: IsoDate
  name: string
  kind: MiniMonthHolidayKind
}

export type MiniMonthCalendarProps = {
  month: string
  today: IsoDate
  nextOn: IsoDate | null
  holidays: readonly MiniMonthHoliday[]
}

export type MiniMonthDayMark = NonNullable<VariantProps<typeof miniMonthDayVariants>['mark']>

export type MiniMonthDayProps = {
  day: number
  mark: MiniMonthDayMark
  isPast?: boolean
  isToday?: boolean
  isNext?: boolean
}

export type MiniMonthCell = {
  key: string
  date: IsoDate | null
}
