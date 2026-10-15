import type { IsoDate } from '@financas/shared'

export type DateRange = {
  from: IsoDate | null
  to: IsoDate | null
}

export type RangeCalendarProps = {
  value: DateRange
  today: IsoDate
  onChange: (range: DateRange) => void
}

export type RangeEndProps = {
  label: string
  value: IsoDate | null
  isNext: boolean
}
