import { incomeShare } from '@shared/reports/metrics/income-share'
import type { PeriodFacts, PeriodPace } from '@shared/reports/metrics/metrics.types'
import { periodProgress } from '@shared/reports/metrics/period-progress'

export function periodPace(facts: PeriodFacts): PeriodPace | null {
  const share = incomeShare(facts)
  if (!share) {
    return null
  }
  const usedPercent = share.spentPercent + share.committedPercent
  const { elapsedPercent } = periodProgress(facts)
  return { usedPercent, elapsedPercent, pointsAhead: usedPercent - elapsedPercent }
}
