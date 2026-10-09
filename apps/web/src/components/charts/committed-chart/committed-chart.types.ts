import type { XAxisTickContentProps } from 'recharts'

export type CommittedMonth = {
  key: string
  label: string
  installmentsPercent: number
  plannedPercent: number
  percentLabel: string
  isHigh: boolean
}

export type CommittedChartProps = {
  months: readonly CommittedMonth[]
  limitPercent: number
  limitLabel: string
  installmentsLabel: string
  plannedLabel: string
  description: string
  className?: string
}

export type MonthTickProps = XAxisTickContentProps & {
  highLabels: ReadonlySet<string>
}
