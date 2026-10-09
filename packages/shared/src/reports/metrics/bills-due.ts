import { addDays, daysBetween } from '@shared/core/calendar/dates'
import { sumCents } from '@shared/reports/metrics/facts'
import type {
  BillDue,
  BillsDue,
  FactOccurrence,
  PeriodFacts,
} from '@shared/reports/metrics/metrics.types'

const DAYS_AHEAD = 6

export function billsDue(facts: PeriodFacts): BillsDue {
  const until = addDays(facts.today, DAYS_AHEAD)
  const bills = facts.occurrences
    .filter(
      (occurrence) =>
        occurrence.status === 'pending' &&
        occurrence.entryType === 'expense' &&
        occurrence.dueOn <= until,
    )
    .sort((left, right) => left.dueOn.localeCompare(right.dueOn))
    .map((occurrence) => billOf(facts, occurrence))
  const coming = bills.filter((bill) => bill.daysFromToday >= 0)
  return {
    until,
    count: coming.length,
    totalCents: sumCents(coming.map((bill) => bill.amountCents)),
    overdueCount: bills.length - coming.length,
    items: bills,
  }
}

function billOf(facts: PeriodFacts, occurrence: FactOccurrence): BillDue {
  return {
    occurrenceId: occurrence.id,
    description: occurrence.description,
    dueOn: occurrence.dueOn,
    amountCents: occurrence.amountCents,
    daysFromToday: daysBetween(facts.today, occurrence.dueOn),
  }
}
