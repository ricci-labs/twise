import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Badge } from '@web/components/display/badge'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { neighbourPeriod } from '@web/features/home/components/period-stage'
import { homeMessages as messages } from '@web/features/home/home.messages'
import type { HomeHeaderProps, PeriodStateProps } from '@web/features/home/home.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import {
  formatDayMonth,
  formatDayMonthLong,
  formatMonthLabel,
  formatRange,
} from '@web/lib/format/calendar'
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
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const { today, period, metrics } = overview
  const step = (direction: -1 | 1) => neighbourPeriod(period.label, direction)
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-title-lg lg:text-display">
          {greetingOf(hour)(displayName)}
        </h1>
        <p className="hidden flex-wrap items-center gap-2 text-body text-ink-muted lg:flex">
          {stage === 'open'
            ? messages.today(formatDayMonthLong(today), metrics.periodProgress.left)
            : messages.period.range(formatDayMonth(period.start), formatDayMonth(period.end))}
          {stage !== 'open' && isDesktop && <PeriodState stage={stage} />}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <nav
          aria-label={messages.period.label}
          className="flex flex-1 items-center justify-between gap-2 rounded-full border border-border bg-surface p-1 lg:w-85 lg:flex-none"
        >
          <Link
            to="."
            search={(previous) => ({ ...previous, period: step(-1) })}
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
            to="."
            search={(previous) => ({ ...previous, period: step(1) })}
            aria-label={messages.period.next}
            className="grid size-10 place-items-center rounded-full hover:bg-sunken"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </Link>
        </nav>
        {stage !== 'closed' && (
          <Button
            variant="secondary"
            className="hidden lg:inline-flex"
            render={<Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'can-i-buy' }} />}
          >
            <TwiseIcon name="bag" size="md" />
            {messages.canIBuy.title}
          </Button>
        )}
      </div>
      {stage !== 'open' && !isDesktop && (
        <p className="flex items-center justify-center gap-2 text-body-sm">
          <PeriodState stage={stage} />
        </p>
      )}
      {!isOnline && (
        <p className="text-center text-body-sm text-ink-muted lg:hidden">
          {messages.updatedAt(UPDATED_TIME.format(updatedAt))}
        </p>
      )}
    </header>
  )
}

function PeriodState({ stage }: PeriodStateProps) {
  return (
    <>
      <Badge tone={stage === 'closed' ? 'neutral' : 'info'}>
        {stage === 'closed' ? messages.period.closed : messages.period.future}
      </Badge>
      <Link
        to="."
        search={(previous) => ({ ...previous, period: undefined })}
        className="font-semibold text-mint-ink underline underline-offset-4"
      >
        {messages.period.backToCurrent}
      </Link>
    </>
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
