import type { IsoDate } from '@shared/core/calendar/calendar.types'
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

export type PeriodImpact = {
  label: string
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

export type PurchaseVerdictReason =
  | { code: 'free_left'; leftCents: number; until: IsoDate }
  | { code: 'period_overspent'; overspentCents: number }
  | { code: 'month_overcommitted'; label: string; percentOfIncome: number }
  | { code: 'month_heavily_committed'; label: string; percentOfIncome: number }

export type PurchaseVerdictOf = {
  verdict: PurchaseVerdict
  verdictReason: PurchaseVerdictReason
}

export type PurchaseImpact = PurchaseVerdictOf & {
  committedReferencePercent: number
  period: PeriodImpact
  coming: ComingPeriodImpact[]
  newInsights: Insight[]
}
