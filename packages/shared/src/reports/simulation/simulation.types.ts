import type { IsoDate, Period } from '@shared/core/calendar/calendar.types'
import type { Insight } from '@shared/reports/insights/insights.types'
import type { FactCard } from '@shared/reports/metrics/metrics.types'
import type { PURCHASE_VERDICTS } from '@shared/reports/simulation/simulation.constants'

export type SimulatedPurchase = {
  amountCents: number
  installmentCount: number
  occurredOn: IsoDate
  card: FactCard | null
  paidFromAccountId: string | null
}

export type PeriodImpact = Period & {
  freeToSpendBefore: number
  freeToSpendAfter: number
  dailyAllowanceBefore: number | null
  dailyAllowanceAfter: number | null
}

export type ComingPeriodImpact = {
  label: string
  committedBefore: number
  committedAfter: number
  percentOfIncomeBefore: number | null
  percentOfIncomeAfter: number | null
}

export type PurchaseVerdict = (typeof PURCHASE_VERDICTS)[number]

export type CardImpact = {
  accountId: string
  limitCents: number | null
  freeBeforeCents: number | null
  freeAfterCents: number | null
}

export type AccountImpact = {
  accountId: string
  balanceTodayBeforeCents: number
  balanceTodayAfterCents: number
}

export type PurchaseVerdictReason =
  | { code: 'free_left'; leftCents: number; until: IsoDate }
  | { code: 'card_limit_exceeded'; exceededCents: number }
  | { code: 'period_overspent'; overspentCents: number }
  | { code: 'month_overcommitted'; label: string; percentOfIncome: number }
  | { code: 'month_heavily_committed'; label: string; percentOfIncome: number }

export type PurchaseVerdictOf = {
  verdict: PurchaseVerdict
  verdictReason: PurchaseVerdictReason
}

export type PurchasePeriod = {
  landsIn: Period | null
  affectsCurrentPeriod: boolean
}

export type PurchaseImpact = PurchaseVerdictOf &
  PurchasePeriod & {
    committedReferencePercent: number
    period: PeriodImpact
    card: CardImpact | null
    account: AccountImpact | null
    coming: ComingPeriodImpact[]
    newInsights: Insight[]
  }
