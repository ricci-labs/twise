import type { Database } from '@api/core/db/db.types'
import type { Period } from '@financas/shared'

export type ReportRouteDeps = {
  db: Database
}

export type PeriodTimeline = {
  period: Period
  recentPeriods: Period[]
  upcomingPeriods: Period[]
}
