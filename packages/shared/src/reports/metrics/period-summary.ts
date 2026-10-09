import type { Period } from '@shared/core/calendar/calendar.types'
import { recentActivePeriods } from '@shared/reports/metrics/facts'
import { freeToSpend } from '@shared/reports/metrics/free-to-spend'
import type { PeriodFacts, PeriodSummary } from '@shared/reports/metrics/metrics.types'

export function periodSummary(facts: PeriodFacts): PeriodSummary | null {
  if (facts.today <= facts.period.end) {
    return null
  }
  const leftCents = freeToSpend(facts)
  if (leftCents < 0) {
    return { leftCents, positiveStreak: 0, streakCapped: false }
  }
  const previous = positiveRunBefore(facts)
  return {
    leftCents,
    positiveStreak: previous + 1,
    streakCapped: previous === facts.recentPeriods.length,
  }
}

function positiveRunBefore(facts: PeriodFacts): number {
  const active = new Set(recentActivePeriods(facts).map((period) => period.label))
  let run = 0
  for (const period of [...facts.recentPeriods].reverse()) {
    if (!active.has(period.label) || !closedPositive(facts, period)) {
      return run
    }
    run += 1
  }
  return run
}

function closedPositive(facts: PeriodFacts, period: Period): boolean {
  return freeToSpend({ ...facts, period }) >= 0
}
