import { dayOfWeek } from '@financas/shared'
import { Badge } from '@web/components/display/badge'
import { DateBlock } from '@web/components/display/date-block'
import { holidayRowMessages as messages } from '@web/components/finance/holiday-row/holiday-row.messages'
import type {
  HolidayRowProps,
  HolidayStatus,
} from '@web/components/finance/holiday-row/holiday-row.types'
import {
  holidayRowActionsVariants,
  holidayRowDetailVariants,
  holidayRowNameVariants,
  holidayRowTextVariants,
  holidayRowVariants,
} from '@web/components/finance/holiday-row/holiday-row.variants'
import { formatDayMonthLong, formatShortWeekday } from '@web/lib/format/calendar'

const SUNDAY = 0
const SATURDAY = 6
const DATE_TONES = {
  past: 'past',
  upcoming: 'default',
  next: 'next',
} as const satisfies Record<HolidayStatus, string>

export function HolidayRow({ onDate, name, status, actions }: HolidayRowProps) {
  const weekday = dayOfWeek(onDate)
  const isWeekend = weekday === SUNDAY || weekday === SATURDAY
  return (
    <li data-slot="holiday-row" className={holidayRowVariants()}>
      <DateBlock date={onDate} tone={DATE_TONES[status]} digits="padded" />
      <span className={holidayRowTextVariants()}>
        <span className="sr-only">{messages.date(formatDayMonthLong(onDate))}</span>
        <span className={holidayRowNameVariants({ isPast: status === 'past' })}>{name}</span>
        <span className={holidayRowDetailVariants()}>
          {status === 'next' && (
            <Badge tone="warning" size="compact" hasDot>
              {messages.next}
            </Badge>
          )}
          {messages.detail(formatShortWeekday(onDate), isWeekend)}
        </span>
      </span>
      {actions && <div className={holidayRowActionsVariants()}>{actions}</div>}
    </li>
  )
}
