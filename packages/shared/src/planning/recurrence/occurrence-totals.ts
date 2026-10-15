import type {
  OccurrenceTotals,
  PendingTotal,
  TotalableOccurrence,
} from '@shared/planning/recurrence/recurrence.types'

export function occurrenceTotals(occurrences: readonly TotalableOccurrence[]): OccurrenceTotals {
  const pending = occurrences.filter((occurrence) => occurrence.status === 'pending')
  const overdue = pending.filter((occurrence) => occurrence.isOverdue)
  return {
    toPay: pendingTotal(pending.filter(isPayment)),
    toReceive: pendingTotal(pending.filter((occurrence) => occurrence.entryType === 'income')),
    groups: {
      overdue: overdue.length,
      upcoming: pending.length - overdue.length,
      matched: countWithStatus(occurrences, 'matched'),
      skipped: countWithStatus(occurrences, 'skipped'),
    },
  }
}

function isPayment(occurrence: TotalableOccurrence): boolean {
  return occurrence.entryType === 'expense' || occurrence.entryType === 'card_purchase'
}

function pendingTotal(pending: readonly TotalableOccurrence[]): PendingTotal {
  return {
    amountCents: pending.reduce((total, occurrence) => total + occurrence.amountCents, 0),
    count: pending.length,
    overdueCount: pending.filter((occurrence) => occurrence.isOverdue).length,
  }
}

function countWithStatus(
  occurrences: readonly TotalableOccurrence[],
  status: TotalableOccurrence['status'],
): number {
  return occurrences.filter((occurrence) => occurrence.status === status).length
}
