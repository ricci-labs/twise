import { addMonths, parseIsoDate, toYearMonthLabel } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { PeriodPicker } from '@web/components/navigation/period-picker'
import { periodsQueryOptions } from '@web/features/entries/api/entries.queries'
import { presetRangeOf } from '@web/features/entries/components/shown-range'
import type { EntriesPeriodProps } from '@web/features/entries/entries.types'
import { useState } from 'react'

const NO_RANGE = { period: undefined, from: undefined, to: undefined, preset: undefined }

export function EntriesPeriod({
  workspaceId,
  search,
  onSearchChange,
  shown,
  periods,
  className,
}: EntriesPeriodProps) {
  const shownYear =
    shown.kind === 'period' ? yearOf(shown.period.label) : parseIsoDate(periods.today).year
  const [year, setYear] = useState(shownYear)
  const [yearFor, setYearFor] = useState(shownYear)
  if (yearFor !== shownYear) {
    setYearFor(shownYear)
    setYear(shownYear)
  }
  const sheet = useQuery(periodsQueryOptions(workspaceId, year))
  const neighbour = (step: -1 | 1) =>
    shown.kind === 'period'
      ? toYearMonthLabel(addMonths(parseIsoDate(`${shown.period.label}-01`), step))
      : undefined
  const stepLink = (step: -1 | 1) => {
    const label = neighbour(step)
    return (
      label && <Link to="." search={(previous) => ({ ...previous, ...NO_RANGE, period: label })} />
    )
  }
  return (
    <PeriodPicker
      className={className}
      title={shown.title}
      detail={shown.detail}
      previous={stepLink(-1) || undefined}
      next={stepLink(1) || undefined}
      sheet={{
        year,
        periods: sheet.data?.periods,
        hasError: sheet.isError,
        chosenLabel: shown.kind === 'period' ? shown.period.label : null,
        currentLabel: periods.currentLabel,
        onYearChange: setYear,
        onRetry: () => void sheet.refetch(),
        onPick: (label) => onSearchChange({ ...NO_RANGE, period: label }),
      }}
      ranges={{
        today: periods.today,
        value: { from: search.from ?? null, to: search.to ?? null },
        onPreset: (preset) =>
          onSearchChange({ ...NO_RANGE, ...presetRangeOf(preset, periods.today), preset }),
        onRange: (range) => onSearchChange({ ...NO_RANGE, ...range }),
      }}
    />
  )
}

function yearOf(label: string): number {
  return parseIsoDate(`${label}-01`).year
}
