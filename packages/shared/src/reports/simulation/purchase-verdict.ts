import type { IsoDate } from '@shared/core/calendar/calendar.types'
import { HEAVILY_COMMITTED_PERCENT } from '@shared/reports/insights/insights.constants'
import { OVERCOMMITTED_PERCENT } from '@shared/reports/simulation/simulation.constants'
import type {
  CardImpact,
  ComingPeriodImpact,
  PeriodImpact,
  PurchaseVerdictOf,
} from '@shared/reports/simulation/simulation.types'

export function purchaseVerdictOf(
  period: PeriodImpact,
  coming: readonly ComingPeriodImpact[],
  periodEnd: IsoDate,
  card: CardImpact | null = null,
): PurchaseVerdictOf {
  const cardFreeAfter = card?.freeAfterCents ?? null
  if (cardFreeAfter !== null && cardFreeAfter < 0) {
    return {
      verdict: 'over',
      verdictReason: { code: 'card_limit_exceeded', exceededCents: -cardFreeAfter },
    }
  }
  if (period.freeToSpendAfter < 0) {
    return {
      verdict: 'over',
      verdictReason: { code: 'period_overspent', overspentCents: -period.freeToSpendAfter },
    }
  }
  const touched = coming.filter((month) => month.committedAfter > month.committedBefore)
  const overcommitted = firstAtOrAbove(touched, OVERCOMMITTED_PERCENT + 1)
  if (overcommitted) {
    return {
      verdict: 'over',
      verdictReason: { code: 'month_overcommitted', ...overcommitted },
    }
  }
  const heavilyCommitted = firstAtOrAbove(touched, HEAVILY_COMMITTED_PERCENT)
  if (heavilyCommitted) {
    return {
      verdict: 'tight',
      verdictReason: { code: 'month_heavily_committed', ...heavilyCommitted },
    }
  }
  return {
    verdict: 'fits',
    verdictReason: { code: 'free_left', leftCents: period.freeToSpendAfter, until: periodEnd },
  }
}

function firstAtOrAbove(months: readonly ComingPeriodImpact[], percent: number) {
  const month = months.find(
    (candidate) =>
      candidate.percentOfIncomeAfter !== null && candidate.percentOfIncomeAfter >= percent,
  )
  return month ? { label: month.label, percentOfIncome: month.percentOfIncomeAfter ?? 0 } : null
}
