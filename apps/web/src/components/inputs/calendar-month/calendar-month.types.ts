import type { IsoDate, YearMonth } from '@financas/shared'

export type CalendarSelection =
  | { mode: 'single'; value: IsoDate | null }
  | { mode: 'range'; from: IsoDate | null; to: IsoDate | null }

export type CalendarMonthProps = {
  month: YearMonth
  today: IsoDate
  selection: CalendarSelection
  onMonthChange: (month: YearMonth) => void
  onPick: (date: IsoDate) => void
}

export type CalendarGridProps = Omit<CalendarMonthProps, 'onMonthChange'> & {
  label: string
}
