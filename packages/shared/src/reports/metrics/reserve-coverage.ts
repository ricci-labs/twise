import { progressPercent } from '@shared/reports/metrics/facts'
import type { PeriodFacts, ReserveCoverage } from '@shared/reports/metrics/metrics.types'
import { spendingAverage } from '@shared/reports/metrics/spending-average'

const TENTHS = 10

export function reserveCoverage(facts: PeriodFacts): ReserveCoverage | null {
  const reserve = facts.goals.find((goal) => goal.isReserve)
  if (!reserve) {
    return null
  }
  const { savedCents, targetCents } = reserve
  const monthlySpendingCents = spendingAverage(facts)?.monthlyCents ?? 0
  const months =
    monthlySpendingCents > 0
      ? Math.round((savedCents * TENTHS) / monthlySpendingCents) / TENTHS
      : null
  return {
    savedCents,
    targetCents,
    percent: progressPercent(savedCents, targetCents),
    monthlySpendingCents,
    months,
  }
}
