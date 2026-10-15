import { type IsoDate, parseIsoDate, type YearMonth } from '@financas/shared'
import { CalendarMonth } from '@web/components/inputs/calendar-month'
import { rangeCalendarMessages as messages } from '@web/components/inputs/range-calendar/range-calendar.messages'
import type {
  DateRange,
  RangeCalendarProps,
  RangeEndProps,
} from '@web/components/inputs/range-calendar/range-calendar.types'
import {
  rangeCalendarVariants,
  rangeEndLabelVariants,
  rangeEndsVariants,
  rangeEndValueVariants,
  rangeEndVariants,
  rangeHintVariants,
} from '@web/components/inputs/range-calendar/range-calendar.variants'
import { formatDayMonth } from '@web/lib/format/calendar'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

export function RangeCalendar({ value, today, onChange, hasEnds = true }: RangeCalendarProps) {
  const [month, setMonth] = useState(() => monthOf(value.from ?? today))
  const isPickingLast = value.from !== null && value.to === null
  return (
    <div data-slot="range-calendar" className={rangeCalendarVariants()}>
      {hasEnds && (
        <>
          <div role="status" className={rangeEndsVariants()}>
            <RangeEnd label={messages.from} value={value.from} isNext={value.from === null} />
            <ArrowRight aria-hidden="true" />
            <RangeEnd label={messages.to} value={value.to} isNext={isPickingLast} />
          </div>
          <p className={rangeHintVariants()}>{messages.hint}</p>
        </>
      )}
      <CalendarMonth
        month={month}
        today={today}
        selection={{ mode: 'range', ...value }}
        onMonthChange={setMonth}
        onPick={(date) => onChange(nextRange(value, date))}
      />
    </div>
  )
}

function RangeEnd({ label, value, isNext }: RangeEndProps) {
  return (
    <p className={rangeEndVariants({ isNext })}>
      <span className={rangeEndLabelVariants()}>{label}</span>
      <span className={rangeEndValueVariants({ isEmpty: value === null })}>
        {value ? formatDayMonth(value) : messages.choose}
      </span>
    </p>
  )
}

function nextRange(range: DateRange, date: IsoDate): DateRange {
  if (range.from === null || range.to !== null || date < range.from) {
    return { from: date, to: null }
  }
  return { from: range.from, to: date }
}

function monthOf(date: IsoDate): YearMonth {
  const { year, month } = parseIsoDate(date)
  return { year, month }
}
