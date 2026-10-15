import type { WeekendRule } from '@shared/core/calendar/calendar.constants'
import type { IsoDate } from '@shared/core/calendar/calendar.types'
import type { AccountKind, EntryType } from '@shared/ledger/ledger/ledger.constants'
import type {
  OccurrenceStatus,
  RecurrenceFrequency,
  RecurringEntryType,
} from '@shared/planning/recurrence/recurrence.constants'

export type RecurrenceSchedule = {
  frequency: RecurrenceFrequency
  interval: number
  dayOfMonth: number | null
  nthBusinessDay: number | null
  weekendRule: WeekendRule
  startsOn: IsoDate
  endsOn: IsoDate | null
}

export type DateRange = {
  from: IsoDate
  to: IsoDate
}

export type RecurringAccountKinds = {
  source: (kind: AccountKind) => boolean
  category: (kind: AccountKind) => boolean
}

export type MatchableEntry = {
  entryType: EntryType
  occurredOn: IsoDate
  postings: ReadonlyArray<{ accountId: string; amountCents: number }>
}

export type MatchableOccurrence = {
  dueOn: IsoDate
  amountCents: number
  amountIsEstimate: boolean
  entryType: RecurringEntryType
  sourceAccountId: string
  categoryAccountId: string
  frequency: RecurrenceFrequency
  interval: number
}

export type SummarizableRecurrence = {
  entryType: RecurringEntryType
  amountIsEstimate: boolean
  frequency: RecurrenceFrequency
  interval: number
  monthlyCents: number
}

export type RecurrenceSummary = {
  bills: {
    monthlyCents: number
    count: number
    includesEstimate: boolean
    includesAveraged: boolean
  }
  income: {
    monthlyCents: number
    count: number
    leftOutEstimateCents: number
    leftOutEstimateCount: number
  }
  transfers: { monthlyCents: number; count: number }
}

export type TotalableOccurrence = {
  entryType: RecurringEntryType
  status: OccurrenceStatus
  isOverdue: boolean
  amountCents: number
}

export type PendingTotal = {
  amountCents: number
  count: number
  overdueCount: number
}

export type OccurrenceTotals = {
  toPay: PendingTotal
  toReceive: PendingTotal
  groups: { overdue: number; upcoming: number; matched: number; skipped: number }
}

export type RankedCandidate<Entry> = Entry & { isLikely: boolean }
