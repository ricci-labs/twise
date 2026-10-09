import type { PeriodFacts, VariableVsAverage } from '@shared/reports/metrics/metrics.types'
import { variableAverage } from '@shared/reports/metrics/variable-average'
import { variableIncome } from '@shared/reports/metrics/variable-income'

const PERCENT = 100

export function variableVsAverage(facts: PeriodFacts): VariableVsAverage | null {
  const average = variableAverage(facts)
  const income = variableIncome(facts)
  if (!average || income === 0) {
    return null
  }
  return { percent: Math.round(((income - average) * PERCENT) / average) }
}
