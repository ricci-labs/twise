import { periodDays } from '@shared/reports/metrics/facts'
import type { PeriodFacts, PeriodProgress } from '@shared/reports/metrics/metrics.types'

const PERCENT = 100

export function periodProgress(facts: PeriodFacts): PeriodProgress {
  const days = periodDays(facts)
  return { ...days, elapsedPercent: Math.round((days.elapsed * PERCENT) / days.total) }
}
