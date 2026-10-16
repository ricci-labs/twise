import { parseIsoDate } from '@financas/shared'
import { MiniMonthDay } from '@web/components/display/mini-month-calendar'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { HolidayActions } from '@web/features/settings/components/holiday-actions'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  HolidayLegendCardProps,
  WorkspaceHolidaysCardProps,
} from '@web/features/settings/settings.types'
import { cn } from '@web/lib/cn'
import { formatPaddedDayMonth, formatWeekday } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'
import { useId } from 'react'

const messages = settingsMessages.holidays
const legend = messages.legend
const CARD =
  'flex h-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-surface px-5.5 py-5'
const CARD_TITLE = 'text-note font-semibold tracking-wide text-ink-muted uppercase'

export function WorkspaceHolidaysCard({
  workspaceId,
  permissions,
  holidays,
}: WorkspaceHolidaysCardProps) {
  const titleId = useId()
  const canDelete = hasPermission(permissions, 'planning', 'delete')
  return (
    <section aria-labelledby={titleId} className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className={CARD_TITLE}>
          {messages.workspaceCount(holidays.length)}
        </h2>
        <span aria-hidden="true" className="size-2.5 rounded-full bg-mint" />
      </div>
      {holidays.length === 0 ? (
        <p className="text-body-sm text-ink-muted">{messages.empty}</p>
      ) : (
        <ul className="flex flex-col">
          {holidays.map((holiday) => {
            const isPast = holiday.status === 'past'
            const weekday = formatWeekday(holiday.onDate)
            return (
              <li
                key={holiday.key}
                className="flex min-h-13 items-center gap-3 border-border py-1.5 not-first:border-t"
              >
                <span
                  className={cn(
                    'w-14 shrink-0 text-label font-bold tabular-nums',
                    isPast && 'text-ink-subtle',
                  )}
                >
                  {formatPaddedDayMonth(holiday.onDate)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      'line-clamp-2 text-row font-semibold break-words',
                      isPast && 'text-ink-subtle',
                    )}
                  >
                    {holiday.name}
                  </span>
                  <span className="text-row-detail text-ink-muted">
                    {isPast ? messages.passed(weekday) : weekday}
                  </span>
                </span>
                {canDelete && (
                  <div className="-mr-2 shrink-0">
                    <HolidayActions workspaceId={workspaceId} holiday={holiday} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <p className="mt-auto text-note text-ink-muted">{messages.workspaceFoot}</p>
    </section>
  )
}

export function HolidayLegendCard({ summary, today }: HolidayLegendCardProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className={CARD}>
      <h2 id={titleId} className={CARD_TITLE}>
        {legend.title}
      </h2>
      <ul className="flex flex-col gap-2.5 text-label font-medium">
        <li className="flex items-center gap-3">
          <span aria-hidden="true">
            <MiniMonthDay day={legend.sampleDays.national} mark="national" />
          </span>
          {legend.national(summary.national)}
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden="true">
            <MiniMonthDay day={legend.sampleDays.workspace} mark="workspace" />
          </span>
          {legend.workspace(summary.workspace)}
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden="true">
            <MiniMonthDay day={legend.sampleDays.past} mark="national" isPast />
          </span>
          {legend.past}
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden="true">
            <MiniMonthDay day={parseIsoDate(today).day} mark="plain" isToday />
          </span>
          {legend.today}
        </li>
      </ul>
      <p className="mt-auto flex items-start gap-2 text-note text-ink-muted">
        <TwiseIcon name="info" size="sm" tone="info" />
        {legend.note}
      </p>
    </section>
  )
}
