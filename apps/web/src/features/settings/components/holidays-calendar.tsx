import { parseIsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { MiniMonthCalendar } from '@web/components/display/mini-month-calendar'
import { NextHolidayCard } from '@web/components/finance/next-holiday-card'
import { holidaysQueryOptions } from '@web/features/settings/api/settings.queries'
import {
  HolidayLegendCard,
  WorkspaceHolidaysCard,
} from '@web/features/settings/components/holiday-summary-cards'
import {
  holidayListsOf,
  monthsOf,
  nextHolidayOf,
} from '@web/features/settings/components/holiday-views'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  HolidaysCalendarProps,
  NextHolidaySlotProps,
} from '@web/features/settings/settings.types'
import { useId } from 'react'

const messages = settingsMessages.holidays

export function HolidaysCalendar({
  workspaceId,
  permissions,
  holidays,
  year,
  today,
}: HolidaysCalendarProps) {
  const monthsId = useId()
  const nextOn = holidays.summary.next?.onDate ?? null
  return (
    <div className="@container flex flex-col gap-5">
      <div className="grid gap-5 @3xl:grid-cols-3">
        <NextHolidaySlot workspaceId={workspaceId} holidays={holidays} year={year} />
        <WorkspaceHolidaysCard
          workspaceId={workspaceId}
          permissions={permissions}
          holidays={holidayListsOf(holidays, today).workspace}
        />
        <HolidayLegendCard summary={holidays.summary} today={today} />
      </div>
      <section aria-labelledby={monthsId}>
        <h2 id={monthsId} className="sr-only">
          {messages.months(year)}
        </h2>
        <div className="grid grid-cols-2 gap-5 @3xl:grid-cols-3 @5xl:grid-cols-4">
          {monthsOf(holidays, year).map(({ month, holidays: ofMonth }) => (
            <MiniMonthCalendar
              key={month}
              month={month}
              today={today}
              nextOn={nextOn}
              holidays={ofMonth}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function NextHolidaySlot({ workspaceId, holidays, year }: NextHolidaySlotProps) {
  const next = holidays.summary.next
  const nextYear = next ? parseIsoDate(next.onDate).year : year
  const ofNextYear = useQuery({
    ...holidaysQueryOptions(workspaceId, nextYear),
    enabled: nextYear !== year,
  })
  const source = nextYear === year ? holidays : ofNextYear.data
  return <NextHolidayCard holiday={next ? nextHolidayOf(next, source) : null} />
}
