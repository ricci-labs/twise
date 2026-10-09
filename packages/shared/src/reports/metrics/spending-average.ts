import { recentActivePeriods } from '@shared/reports/metrics/facts'
import type { PeriodFacts, SpendingAverage } from '@shared/reports/metrics/metrics.types'
import { spentIn } from '@shared/reports/metrics/spent'

const PERIODS_OF_SPENDING = 3

export function spendingAverage(facts: PeriodFacts): SpendingAverage | null {
  const periods = recentActivePeriods(facts, PERIODS_OF_SPENDING)
  if (periods.length === 0) {
    return null
  }
  const totalSpent = periods.reduce((sum, period) => sum + spentIn(facts, period), 0)
  return { monthlyCents: Math.round(totalSpent / periods.length), periods: periods.length }
}
