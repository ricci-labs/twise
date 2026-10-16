import { dayOfWeek, daysInMonth, type IsoDate, parseIsoDate, toIsoDate } from '@financas/shared'
import { miniMonthCalendarMessages as messages } from '@web/components/display/mini-month-calendar/mini-month-calendar.messages'
import type {
  MiniMonthCalendarProps,
  MiniMonthCell,
  MiniMonthDayMark,
  MiniMonthDayProps,
  MiniMonthHoliday,
} from '@web/components/display/mini-month-calendar/mini-month-calendar.types'
import {
  miniMonthCellVariants,
  miniMonthDayVariants,
  miniMonthGridVariants,
  miniMonthItemDayVariants,
  miniMonthItemNameVariants,
  miniMonthItemTagVariants,
  miniMonthItemVariants,
  miniMonthListVariants,
  miniMonthNoneVariants,
  miniMonthTitleVariants,
  miniMonthVariants,
  miniMonthWeekdayVariants,
} from '@web/components/display/mini-month-calendar/mini-month-calendar.variants'
import { formatMonthTitle } from '@web/lib/format/calendar'
import { useId } from 'react'

const FIRST_DAY = '-01'
const MONTH_LENGTH = 7
const PADDED_DAY_LENGTH = 2
const SUNDAY = 0
const SATURDAY = 6

export function MiniMonthCalendar({ month, today, nextOn, holidays }: MiniMonthCalendarProps) {
  const titleId = useId()
  const thisMonth = today.slice(0, MONTH_LENGTH)
  const isPastMonth = month < thisMonth
  const byDate = new Map(holidays.map((holiday) => [holiday.onDate, holiday]))
  const sorted = [...holidays].sort((left, right) => left.onDate.localeCompare(right.onDate))
  return (
    <section
      data-slot="mini-month-calendar"
      aria-labelledby={titleId}
      className={miniMonthVariants({ isCurrent: month === thisMonth })}
    >
      <h3 id={titleId} className={miniMonthTitleVariants({ isPast: isPastMonth })}>
        {formatMonthTitle(month)}
      </h3>
      <div aria-hidden="true" className={miniMonthGridVariants()}>
        {messages.weekdays.map((weekday) => (
          <span key={weekday.key} className={miniMonthWeekdayVariants()}>
            {weekday.label}
          </span>
        ))}
        {cellsOf(month).map(({ key, date }) => (
          <span key={key} className={miniMonthCellVariants()}>
            {date && (
              <MiniMonthDay
                day={parseIsoDate(date).day}
                mark={markOf(date, byDate.get(date))}
                isPast={byDate.has(date) ? date < today : isPastMonth}
                isToday={date === today}
                isNext={date === nextOn}
              />
            )}
          </span>
        ))}
      </div>
      <ul className={miniMonthListVariants()}>
        {sorted.length === 0 && <li className={miniMonthNoneVariants()}>{messages.none}</li>}
        {sorted.map((holiday) => (
          <li
            key={holiday.onDate}
            className={miniMonthItemVariants({ isPast: holiday.onDate < today })}
          >
            <span className={miniMonthItemDayVariants()}>
              {String(parseIsoDate(holiday.onDate).day).padStart(PADDED_DAY_LENGTH, '0')}
            </span>
            <span className={miniMonthItemNameVariants()}>{holiday.name}</span>
            {holiday.kind === 'workspace' && (
              <span className={miniMonthItemTagVariants()}>{messages.workspace}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function MiniMonthDay({
  day,
  mark,
  isPast = false,
  isToday = false,
  isNext = false,
}: MiniMonthDayProps) {
  return (
    <span
      data-slot="mini-month-day"
      className={miniMonthDayVariants({ mark, isPast, isToday, isNext })}
    >
      {day}
    </span>
  )
}

function cellsOf(month: string): MiniMonthCell[] {
  const first: IsoDate = `${month}${FIRST_DAY}`
  const { year, month: monthNumber } = parseIsoDate(first)
  const blanks = Array.from({ length: dayOfWeek(first) }, (_, position) => ({
    key: `blank-${position}`,
    date: null,
  }))
  const days = Array.from({ length: daysInMonth({ year, month: monthNumber }) }, (_, position) => {
    const date = toIsoDate(year, monthNumber, position + 1)
    return { key: date, date }
  })
  return [...blanks, ...days]
}

function markOf(date: IsoDate, holiday: MiniMonthHoliday | undefined): MiniMonthDayMark {
  if (holiday) {
    return holiday.kind
  }
  const weekday = dayOfWeek(date)
  return weekday === SUNDAY || weekday === SATURDAY ? 'weekend' : 'plain'
}
