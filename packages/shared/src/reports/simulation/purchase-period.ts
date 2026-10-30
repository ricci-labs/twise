import { isInPeriod } from '@shared/core/calendar/period'
import type { PeriodFacts } from '@shared/reports/metrics/metrics.types'
import { SIMULATED_CATEGORY_ID } from '@shared/reports/simulation/simulation.constants'
import type { PurchasePeriod } from '@shared/reports/simulation/simulation.types'

export function purchasePeriodOf(withPurchase: PeriodFacts): PurchasePeriod {
  const countedOn = withPurchase.postings
    .filter((posting) => posting.accountId === SIMULATED_CATEGORY_ID)
    .map((posting) =>
      withPurchase.installmentBudgetView === 'purchase_month'
        ? posting.occurredOn
        : posting.effectiveOn,
    )
    .sort()
  const first = countedOn[0]
  const periods = [
    ...withPurchase.recentPeriods,
    withPurchase.period,
    ...withPurchase.upcomingPeriods,
  ]
  return {
    landsIn: (first && periods.find((period) => isInPeriod(first, period))) || null,
    affectsCurrentPeriod: countedOn.some((date) => isInPeriod(date, withPurchase.period)),
  }
}
