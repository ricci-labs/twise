import { addMonths, parseIsoDate, toYearMonthLabel } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { PeriodPicker } from '@web/components/navigation/period-picker'
import { periodsQueryOptions } from '@web/features/planning/api/planning.queries'
import { planningMessages as messages } from '@web/features/planning/planning.messages'
import type { PlanningPeriodProps } from '@web/features/planning/planning.types'
import { formatMonthLabel, formatRange } from '@web/lib/format/calendar'
import { useState } from 'react'

export function PlanningPeriod({
  workspaceId,
  label,
  start,
  end,
  currentLabel,
}: PlanningPeriodProps) {
  const navigate = useNavigate()
  const [year, setYear] = useState(() => yearOf(label))
  const [yearFor, setYearFor] = useState(label)
  if (yearFor !== label) {
    setYearFor(label)
    setYear(yearOf(label))
  }
  const sheet = useQuery(periodsQueryOptions(workspaceId, year))
  const step = (direction: -1 | 1) => neighbourOf(label, direction)
  return (
    <PeriodPicker
      label={messages.period.label}
      className="w-full lg:w-85"
      title={formatMonthLabel(label)}
      detail={formatRange(start, end)}
      previous={<Link to="." search={(previous) => ({ ...previous, period: step(-1) })} />}
      next={<Link to="." search={(previous) => ({ ...previous, period: step(1) })} />}
      sheet={{
        year,
        periods: sheet.data?.periods,
        hasError: sheet.isError,
        chosenLabel: label,
        currentLabel,
        onYearChange: setYear,
        onRetry: () => void sheet.refetch(),
        onPick: (picked) =>
          void navigate({ to: '.', search: (previous) => ({ ...previous, period: picked }) }),
      }}
    />
  )
}

export function yearOf(label: string): number {
  return parseIsoDate(`${label}-01`).year
}

function neighbourOf(label: string, step: -1 | 1): string {
  return toYearMonthLabel(addMonths(parseIsoDate(`${label}-01`), step))
}
