import type { IsoDate, Period } from '@shared/core/calendar/calendar.types'
import type { Insight } from '@shared/reports/insights/insights.types'
import type { PeriodMetrics } from '@shared/reports/metrics/metrics'

export type PeriodOverview = {
  today: IsoDate
  period: Period
  metrics: PeriodMetrics
  insights: Insight[]
}
