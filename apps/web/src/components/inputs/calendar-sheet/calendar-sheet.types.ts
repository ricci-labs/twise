import type { IsoDate, YearMonth } from '@financas/shared'

export type CalendarSheetProps = {
  title: string
  value: IsoDate | null
  today: IsoDate
  anchor?: Element | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSelect: (date: IsoDate) => void
}

export type CalendarMonthProps = {
  month: YearMonth
  value: IsoDate | null
  today: IsoDate
  onSelect: (date: IsoDate) => void
}
