import { budgetIncome } from '@shared/reports/metrics/budget-income'
import { committed } from '@shared/reports/metrics/committed'
import type { IncomeShare, PeriodFacts } from '@shared/reports/metrics/metrics.types'
import { spent } from '@shared/reports/metrics/spent'

const PERCENT = 100

export function incomeShare(facts: PeriodFacts): IncomeShare | null {
  const incomeCents = budgetIncome(facts)
  if (incomeCents <= 0) {
    return null
  }
  const spentPercent = Math.round((spent(facts) * PERCENT) / incomeCents)
  const committedPercent = Math.round((committed(facts) * PERCENT) / incomeCents)
  return {
    spentPercent,
    committedPercent,
    freePercent: Math.max(PERCENT - spentPercent - committedPercent, 0),
  }
}
