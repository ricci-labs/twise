import {
  type RecurrenceFrequency,
  STEPS_PER_YEAR,
} from '@shared/planning/recurrence/recurrence.constants'
import type {
  RecurrenceSummary,
  SummarizableRecurrence,
} from '@shared/planning/recurrence/recurrence.types'

const MONTHS_PER_YEAR = 12

export function monthlyEquivalentCents(
  amountCents: number,
  { frequency, interval }: { frequency: RecurrenceFrequency; interval: number },
): number {
  return Math.round((amountCents * STEPS_PER_YEAR[frequency]) / (MONTHS_PER_YEAR * interval))
}

export function recurrenceSummary(
  recurrences: readonly SummarizableRecurrence[],
): RecurrenceSummary {
  const bills = recurrences.filter(isBill)
  const income = recurrences.filter((recurrence) => recurrence.entryType === 'income')
  const fixedIncome = income.filter((recurrence) => !recurrence.amountIsEstimate)
  const estimatedIncome = income.filter((recurrence) => recurrence.amountIsEstimate)
  const transfers = recurrences.filter((recurrence) => recurrence.entryType === 'transfer')
  return {
    bills: {
      monthlyCents: monthlyTotal(bills),
      count: bills.length,
      includesEstimate: bills.some((bill) => bill.amountIsEstimate),
      includesAveraged: bills.some(isAveraged),
    },
    income: {
      monthlyCents: monthlyTotal(fixedIncome),
      count: fixedIncome.length,
      leftOutEstimateCents: monthlyTotal(estimatedIncome),
      leftOutEstimateCount: estimatedIncome.length,
    },
    transfers: { monthlyCents: monthlyTotal(transfers), count: transfers.length },
  }
}

function isBill(recurrence: SummarizableRecurrence): boolean {
  return recurrence.entryType === 'expense' || recurrence.entryType === 'card_purchase'
}

function isAveraged(recurrence: SummarizableRecurrence): boolean {
  return recurrence.frequency !== 'monthly' || recurrence.interval !== 1
}

function monthlyTotal(recurrences: readonly SummarizableRecurrence[]): number {
  return recurrences.reduce((total, recurrence) => total + recurrence.monthlyCents, 0)
}
