import type { PeriodFacts, ReserveCoverage } from '@shared/reports/metrics/metrics.types'
import { spendingAverage } from '@shared/reports/metrics/spending-average'

const TENTHS = 10

export function reserveCoverage(facts: PeriodFacts): ReserveCoverage | null {
  if (!facts.reserve) {
    return null
  }
  const { savedCents, targetCents } = facts.reserve
  const monthlySpendingCents = spendingAverage(facts)?.monthlyCents ?? 0
  const months =
    monthlySpendingCents > 0
      ? Math.round((savedCents * TENTHS) / monthlySpendingCents) / TENTHS
      : null
  return { savedCents, targetCents, monthlySpendingCents, months }
}
