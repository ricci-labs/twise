import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import {
  addDays,
  addMonths,
  dayOfWeek,
  daysInMonth,
  type IsoDate,
  parseIsoDate,
  toIsoDate,
  toYearMonthLabel,
  type YearMonth,
} from '@financas/shared'
import { calendarMonthMessages as messages } from '@web/components/inputs/calendar-month/calendar-month.messages'
import type {
  CalendarGridProps,
  CalendarMonthProps,
} from '@web/components/inputs/calendar-month/calendar-month.types'
import {
  calendarDayVariants,
  calendarGridVariants,
  calendarHeadVariants,
  calendarMonthVariants,
  calendarRangeCellVariants,
  calendarStepVariants,
  calendarTitleVariants,
  calendarTodayDotVariants,
  calendarWeekdayVariants,
} from '@web/components/inputs/calendar-month/calendar-month.variants'
import { formatDayMonthLong, formatMonthTitle } from '@web/lib/format/calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const
const LAST_WEEKDAY = 6

export function CalendarMonth({
  month,
  today,
  selection,
  onMonthChange,
  onPick,
}: CalendarMonthProps) {
  const label = messages.month(formatMonthTitle(toYearMonthLabel(month)), month.year)
  return (
    <div data-slot="calendar-month" className={calendarMonthVariants()}>
      <div className={calendarHeadVariants()}>
        <button
          type="button"
          aria-label={messages.previous}
          className={calendarStepVariants()}
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <p aria-live="polite" className={calendarTitleVariants()}>
          {label}
        </p>
        <button
          type="button"
          aria-label={messages.next}
          className={calendarStepVariants()}
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div aria-hidden="true" className={calendarGridVariants({ mode: selection.mode })}>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className={calendarWeekdayVariants()}>
            {messages.weekdays[weekday]}
          </span>
        ))}
      </div>
      {selection.mode === 'single' ? (
        <SingleGrid
          month={month}
          today={today}
          selection={selection}
          label={label}
          onPick={onPick}
        />
      ) : (
        <RangeGrid
          month={month}
          today={today}
          selection={selection}
          label={label}
          onPick={onPick}
        />
      )}
    </div>
  )
}

function SingleGrid({ month, today, selection, label, onPick }: CalendarGridProps) {
  const value = selection.mode === 'single' ? selection.value : null
  const first = toIsoDate(month.year, month.month, 1)
  return (
    <RadioGroup
      aria-label={label}
      value={value ?? ''}
      onValueChange={(next) => onPick(next as IsoDate)}
      className={calendarGridVariants({ mode: 'single' })}
    >
      {daysOf(month).map((date) => (
        <Radio.Root
          key={date}
          value={date}
          nativeButton
          render={<button type="button" />}
          aria-label={formatDayMonthLong(date)}
          data-today={date === today ? '' : undefined}
          data-chosen={date === value ? '' : undefined}
          onClick={() => {
            if (date === value) {
              onPick(date)
            }
          }}
          className={calendarDayVariants({
            startsOn: date === first ? WEEKDAYS[dayOfWeek(first)] : 'none',
          })}
        >
          {parseIsoDate(date).day}
          {date === today && <span aria-hidden="true" className={calendarTodayDotVariants()} />}
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

function RangeGrid({ month, today, selection, label, onPick }: CalendarGridProps) {
  const from = selection.mode === 'range' ? selection.from : null
  const to = selection.mode === 'range' ? selection.to : null
  return (
    <fieldset aria-label={label} className={calendarGridVariants({ mode: 'range' })}>
      {weeksOf(month).map((date) => {
        const isEnd = date === from || date === to
        const isInRange = from !== null && to !== null && date >= from && date <= to
        return (
          <span key={date} className={calendarRangeCellVariants({ isInRange })}>
            <button
              type="button"
              aria-label={formatDayMonthLong(date)}
              aria-pressed={isEnd}
              data-today={date === today ? '' : undefined}
              data-chosen={isEnd ? '' : undefined}
              className={calendarDayVariants({ shape: 'box' })}
              onClick={() => onPick(date)}
            >
              {parseIsoDate(date).day}
              {date === today && <span aria-hidden="true" className={calendarTodayDotVariants()} />}
            </button>
          </span>
        )
      })}
    </fieldset>
  )
}

function daysOf(month: YearMonth): IsoDate[] {
  return Array.from({ length: daysInMonth(month) }, (_, index) =>
    toIsoDate(month.year, month.month, index + 1),
  )
}

function weeksOf(month: YearMonth): IsoDate[] {
  const first = toIsoDate(month.year, month.month, 1)
  const last = toIsoDate(month.year, month.month, daysInMonth(month))
  const start = addDays(first, -dayOfWeek(first))
  const end = addDays(last, LAST_WEEKDAY - dayOfWeek(last))
  const days: IsoDate[] = []
  for (let date = start; date <= end; date = addDays(date, 1)) {
    days.push(date)
  }
  return days
}
