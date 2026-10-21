import type { Database } from '@api/core/db/db.types'
import type { IsoDate, Period } from '@financas/shared'

export type ReportRouteDeps = {
  db: Database
}

export type PeriodTimeline = {
  period: Period
  recentPeriods: Period[]
  upcomingPeriods: Period[]
}

export type PeriodWindow = {
  period: Period
  today: IsoDate
  latest: IsoDate
}
