import { type Period, parseIsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Badge } from '@web/components/display/badge'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PeriodPicker } from '@web/components/navigation/period-picker'
import { periodsQueryOptions } from '@web/features/home/api/home.queries'
import { neighbourPeriod } from '@web/features/home/components/period-stage'
import { homeMessages as messages } from '@web/features/home/home.messages'
import type {
  HomeHeaderProps,
  HomePeriodPickerProps,
  PeriodStateProps,
} from '@web/features/home/home.types'
import { useIsOnline } from '@web/hooks/use-is-online'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import {
  formatDayMonth,
  formatDayMonthLong,
  formatMonthLabel,
  formatRange,
} from '@web/lib/format/calendar'
import { useState } from 'react'

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
  return (
    <header className="flex flex-col gap-3 lg:mb-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-form-title-lg lg:text-display">
          {greetingOf(hour)(displayName)}
        </h1>
        <p className="hidden flex-wrap items-center gap-2 text-dialog-text text-ink-muted lg:flex">
          {stage === 'open'
            ? messages.today(formatDayMonthLong(today), metrics.periodProgress.left)
            : messages.period.range(formatDayMonth(period.start), formatDayMonth(period.end))}
          {stage !== 'open' && isDesktop && <PeriodState stage={stage} />}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <HomePeriodPicker workspaceId={workspaceId} period={period} />
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

function HomePeriodPicker({ workspaceId, period }: HomePeriodPickerProps) {
  const navigate = useNavigate()
  const [year, setYear] = useState(() => yearOf(period.label))
  const [yearFor, setYearFor] = useState(period.label)
  if (yearFor !== period.label) {
    setYearFor(period.label)
    setYear(yearOf(period.label))
  }
  const periods = useQuery(periodsQueryOptions(workspaceId, year))
  const step = (direction: -1 | 1) => neighbourPeriod(period.label, direction)
  return (
    <PeriodPicker
      label={messages.period.label}
      className="flex-1 lg:w-85 lg:flex-none"
      title={formatMonthLabel(period.label)}
      detail={formatRange(period.start, period.end)}
      previous={<Link to="." search={(previous) => ({ ...previous, period: step(-1) })} />}
      next={<Link to="." search={(previous) => ({ ...previous, period: step(1) })} />}
      sheet={{
        year,
        periods: periods.data?.periods,
        hasError: periods.isError,
        chosenLabel: period.label,
        currentLabel: periods.data?.currentLabel ?? period.label,
        note: startNoteOf(periods.data?.periods),
        onYearChange: setYear,
        onRetry: () => void periods.refetch(),
        onPick: (label) =>
          void navigate({ to: '.', search: (previous) => ({ ...previous, period: label }) }),
      }}
    />
  )
}

function yearOf(label: string): number {
  return parseIsoDate(`${label}-01`).year
}

function startNoteOf(periods: readonly Period[] | undefined): string | undefined {
  const days = new Set(periods?.map((period) => parseIsoDate(period.start).day))
  const [day] = days
  return days.size === 1 && day !== undefined ? messages.period.startsOn(day) : undefined
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
