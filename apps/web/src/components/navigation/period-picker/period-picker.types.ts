import type { IsoDate, Period } from '@financas/shared'
import type { DateRange } from '@web/components/inputs/range-calendar'
import type { ReactElement } from 'react'

export type PeriodPreset = 'last30Days' | 'thisYear'

export type PeriodSheetData = {
  year: number
  periods: readonly Period[] | undefined
  hasError?: boolean
  chosenLabel: string | null
  currentLabel: string
  note?: string
  onYearChange: (year: number) => void
  onRetry?: () => void
  onPick: (label: string) => void
}

export type PeriodRanges = {
  today: IsoDate
  value: DateRange
  onPreset: (preset: PeriodPreset) => void
  onRange: (range: { from: IsoDate; to: IsoDate }) => void
}

export type PeriodPickerProps = {
  title: string
  detail?: string
  label?: string
  previous?: ReactElement
  next?: ReactElement
  sheet: PeriodSheetData
  ranges?: PeriodRanges
  className?: string
}

export type PeriodMonthsProps = PeriodSheetData & {
  ranges?: PeriodRanges
  onChooseDates: () => void
  onDone: () => void
}

export type PeriodDatesProps = {
  ranges: PeriodRanges
  onBack: () => void
  onDone: () => void
}

export type PeriodStepProps = {
  link: ReactElement | undefined
  label: string
  direction: 'previous' | 'next'
}
