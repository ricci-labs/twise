import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import {
  addMonths,
  dayOfWeek,
  daysInMonth,
  type IsoDate,
  parseIsoDate,
  toIsoDate,
  toYearMonthLabel,
  type YearMonth,
} from '@financas/shared'
import { calendarSheetMessages as messages } from '@web/components/inputs/calendar-sheet/calendar-sheet.messages'
import type {
  CalendarMonthProps,
  CalendarSheetProps,
} from '@web/components/inputs/calendar-sheet/calendar-sheet.types'
import {
  calendarDayVariants,
  calendarGridVariants,
  calendarHeadVariants,
  calendarMonthVariants,
  calendarStepVariants,
  calendarTodayDotVariants,
  calendarWeekdayVariants,
} from '@web/components/inputs/calendar-sheet/calendar-sheet.variants'
import { Sheet } from '@web/components/layout/sheet'
import { formatDayMonthLong, formatMonthTitle } from '@web/lib/format/calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export function CalendarSheet({
  title,
  value,
  today,
  anchor,
  isOpen,
  onOpenChange,
  onSelect,
}: CalendarSheetProps) {
  const [month, setMonth] = useState(() => monthOf(value ?? today))
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setMonth(monthOf(value ?? today))
    }
  }
  const label = toYearMonthLabel(month)
  return (
    <Sheet
      title={title}
      closeLabel={messages.close}
      anchor={anchor}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className={calendarHeadVariants()}>
        <button
          type="button"
          aria-label={messages.previous}
          className={calendarStepVariants()}
          onClick={() => setMonth(addMonths(month, -1))}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <p aria-live="polite" className={calendarMonthVariants()}>
          {messages.month(formatMonthTitle(label), month.year)}
        </p>
        <button
          type="button"
          aria-label={messages.next}
          className={calendarStepVariants()}
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <CalendarMonth month={month} value={value} today={today} onSelect={onSelect} />
    </Sheet>
  )
}

function CalendarMonth({ month, value, today, onSelect }: CalendarMonthProps) {
  const first = toIsoDate(month.year, month.month, 1)
  const days = Array.from({ length: daysInMonth(month) }, (_, index) =>
    toIsoDate(month.year, month.month, index + 1),
  )
  return (
    <div className="flex flex-col gap-1">
      <div aria-hidden="true" className={calendarGridVariants()}>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className={calendarWeekdayVariants()}>
            {messages.weekdays[weekday]}
          </span>
        ))}
      </div>
      <RadioGroup
        aria-label={messages.month(formatMonthTitle(toYearMonthLabel(month)), month.year)}
        value={value ?? ''}
        onValueChange={(next) => onSelect(next as IsoDate)}
        className={calendarGridVariants()}
      >
        {days.map((date) => (
          <Radio.Root
            key={date}
            value={date}
            nativeButton
            render={<button type="button" />}
            aria-label={formatDayMonthLong(date)}
            data-today={date === today ? '' : undefined}
            onClick={() => {
              if (date === value) {
                onSelect(date)
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
    </div>
  )
}

function monthOf(date: IsoDate): YearMonth {
  const { year, month } = parseIsoDate(date)
  return { year, month }
}
