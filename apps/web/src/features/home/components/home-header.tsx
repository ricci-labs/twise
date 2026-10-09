import { Link } from '@tanstack/react-router'
import { Badge } from '@web/components/display/badge'
import { neighbourPeriod } from '@web/features/home/components/period-stage'
import { homeMessages as messages } from '@web/features/home/home.messages'
import type { HomeHeaderProps } from '@web/features/home/home.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { formatDayMonthLong, formatMonthLabel, formatRange } from '@web/lib/format/calendar'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

export function HomeHeader({
  workspaceId,
  overview,
  stage,
  displayName,
  hour,
  updatedAt,
}: HomeHeaderProps) {
  const isOnline = useIsOnline()
  const { today, period, metrics } = overview
  const step = (direction: -1 | 1) => neighbourPeriod(period.label, direction)
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-title-lg lg:text-display">
          {greetingOf(hour)(displayName)}
        </h1>
        <p className="flex flex-wrap items-center gap-2 text-body-sm text-ink-muted">
          {messages.today(
            formatDayMonthLong(today),
            stage === 'open' ? metrics.periodProgress.left : 0,
          )}
          {!isOnline && (
            <span className="font-semibold">
              {messages.updatedAt(UPDATED_TIME.format(updatedAt))}
            </span>
          )}
          {stage !== 'open' && (
            <>
              <Badge tone={stage === 'closed' ? 'neutral' : 'info'}>
                {stage === 'closed' ? messages.period.closed : messages.period.future}
              </Badge>
              <Link
                to="/w/$workspaceId"
                params={{ workspaceId }}
                className="font-semibold text-mint-ink underline"
              >
                {messages.period.backToCurrent}
              </Link>
            </>
          )}
        </p>
      </div>
      <nav
        aria-label={messages.period.label}
        className="flex items-center justify-between gap-2 rounded-full border border-border bg-surface p-1 lg:min-w-96"
      >
        <Link
          to="/w/$workspaceId"
          params={{ workspaceId }}
          search={{ period: step(-1) }}
          aria-label={messages.period.previous}
          className="grid size-10 place-items-center rounded-full hover:bg-sunken"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
        <p className="flex items-center gap-2 text-body">
          <CalendarDays className="size-4 text-ink-muted" aria-hidden="true" />
          <span className="font-semibold">{formatMonthLabel(period.label)}</span>
          <span className="text-ink-muted">· {formatRange(period.start, period.end)}</span>
        </p>
        <Link
          to="/w/$workspaceId"
          params={{ workspaceId }}
          search={{ period: step(1) }}
          aria-label={messages.period.next}
          className="grid size-10 place-items-center rounded-full hover:bg-sunken"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </Link>
      </nav>
    </header>
  )
}

const UPDATED_TIME = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  minute: '2-digit',
})
const MORNING_ENDS = 12
const AFTERNOON_ENDS = 18

function greetingOf(hour: number) {
  if (hour < MORNING_ENDS) {
    return messages.greeting.morning
  }
  return hour < AFTERNOON_ENDS ? messages.greeting.afternoon : messages.greeting.evening
}
