import type { DateBlockProps } from '@web/components/display/date-block/date-block.types'
import {
  dateBlockDayVariants,
  dateBlockMonthVariants,
  dateBlockVariants,
} from '@web/components/display/date-block/date-block.variants'
import { dateBlockOf } from '@web/lib/format/calendar'

const PADDED_DAY_LENGTH = 2

export function DateBlock({ date, tone = 'default', digits = 'plain' }: DateBlockProps) {
  const block = dateBlockOf(date)
  const day = digits === 'padded' ? block.day.padStart(PADDED_DAY_LENGTH, '0') : block.day
  return (
    <span data-slot="date-block" aria-hidden="true" className={dateBlockVariants({ tone })}>
      <span className={dateBlockDayVariants()}>{day}</span>
      <span className={dateBlockMonthVariants({ tone })}>{block.month}</span>
    </span>
  )
}
