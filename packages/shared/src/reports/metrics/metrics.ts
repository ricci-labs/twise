import { balanceForecast } from '@shared/reports/metrics/balance-forecast'
import { billsDue } from '@shared/reports/metrics/bills-due'
import { budgetIncome } from '@shared/reports/metrics/budget-income'
import { budgetPace } from '@shared/reports/metrics/budget-pace'
import { committed } from '@shared/reports/metrics/committed'
import { committedAhead } from '@shared/reports/metrics/committed-ahead'
import { dailyAllowance } from '@shared/reports/metrics/daily-allowance'
import { fixedIncome } from '@shared/reports/metrics/fixed-income'
import { freeToSpend } from '@shared/reports/metrics/free-to-spend'
import { goalProgress } from '@shared/reports/metrics/goal-progress'
import { incomeShare } from '@shared/reports/metrics/income-share'
import type { PeriodFacts } from '@shared/reports/metrics/metrics.types'
import { nextInvoice } from '@shared/reports/metrics/next-invoice'
import { periodPace } from '@shared/reports/metrics/period-pace'
import { periodProgress } from '@shared/reports/metrics/period-progress'
import { periodSummary } from '@shared/reports/metrics/period-summary'
import { receivables } from '@shared/reports/metrics/receivables'
import { reserveCoverage } from '@shared/reports/metrics/reserve-coverage'
import { spendingAverage } from '@shared/reports/metrics/spending-average'
import { spent } from '@shared/reports/metrics/spent'
import { variableAverage } from '@shared/reports/metrics/variable-average'
import { variableIncome } from '@shared/reports/metrics/variable-income'
import { variableVsAverage } from '@shared/reports/metrics/variable-vs-average'

export const METRICS = {
  fixedIncome,
  variableIncome,
  budgetIncome,
  spent,
  committed,
  freeToSpend,
  dailyAllowance,
  periodProgress,
  spendingAverage,
  incomeShare,
  periodPace,
  budgetPace,
  variableAverage,
  variableVsAverage,
  reserveCoverage,
  goalProgress,
  committedAhead,
  nextInvoice,
  balanceForecast,
  billsDue,
  receivables,
  periodSummary,
} as const

export type PeriodMetrics = { [Key in keyof typeof METRICS]: ReturnType<(typeof METRICS)[Key]> }

export function computeMetrics(facts: PeriodFacts): PeriodMetrics {
  return Object.fromEntries(
    Object.entries(METRICS).map(([key, metric]) => [key, metric(facts)]),
  ) as PeriodMetrics
}
