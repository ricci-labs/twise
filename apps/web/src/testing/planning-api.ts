import { CARD, CHECKING, GROCERIES, SAVINGS } from '@web/testing/accounts-api'
import { WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NO_CATEGORY = '00000000-0000-4000-8000-0000000000d9'

export function plannedOccurrence(
  id: string,
  dueOn: string,
  description: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    ruleId: `rule-${id}`,
    description,
    entryType: 'expense',
    sourceAccountId: CHECKING,
    categoryAccountId: NO_CATEGORY,
    dueOn,
    amountCents: 12000,
    amountIsEstimate: false,
    status: 'pending',
    matchedEntryId: null,
    skippedByUserId: null,
    frequency: 'monthly',
    interval: 1,
    isOverdue: false,
    paidOn: null,
    paidCents: null,
    ...overrides,
  }
}

export const OCTOBER_OCCURRENCES = [
  plannedOccurrence('o1', '2026-10-18', 'Internet', { isOverdue: true }),
  plannedOccurrence('o2', '2026-10-20', 'Celular', { sourceAccountId: CARD, amountCents: 6990 }),
  plannedOccurrence('o3', '2026-10-22', 'Luz', { amountCents: 18000, amountIsEstimate: true }),
  plannedOccurrence('o4', '2026-11-03', 'Vale-alimentação', {
    entryType: 'income',
    amountCents: 80000,
  }),
  plannedOccurrence('o5', '2026-10-16', 'Diarista', {
    status: 'matched',
    matchedEntryId: 'e1',
    amountCents: 18000,
    paidOn: '2026-10-16',
    paidCents: 18000,
  }),
  plannedOccurrence('o6', '2026-10-10', 'Reserva', {
    entryType: 'transfer',
    categoryAccountId: SAVINGS,
    status: 'skipped',
    amountCents: 60000,
  }),
]

export const OCTOBER_OCCURRENCE_TOTALS = {
  toPay: { amountCents: 36990, count: 3, overdueCount: 1 },
  toReceive: { amountCents: 80000, count: 1, overdueCount: 0 },
  groups: { overdue: 1, upcoming: 3, matched: 1, skipped: 1 },
}

export function occurrencesAnswer(
  items: readonly object[] = OCTOBER_OCCURRENCES,
  totals: object = OCTOBER_OCCURRENCE_TOTALS,
): Record<string, FakeAnswer> {
  return { [`GET ${BASE}/occurrences`]: () => Response.json({ items, totals }) }
}

export const INTERNET_CANDIDATES = [
  {
    entryId: '00000000-0000-4000-8000-0000000005a1',
    description: 'Internet Fibra',
    occurredOn: '2026-10-19',
    amountCents: 12000,
    counterpartAccountId: null,
    isLikely: true,
  },
  {
    entryId: '00000000-0000-4000-8000-0000000005a2',
    description: 'Mercado da semana',
    occurredOn: '2026-10-20',
    amountCents: 8640,
    counterpartAccountId: GROCERIES,
    isLikely: false,
  },
]

export function candidatesAnswer(
  occurrenceId: string,
  items: readonly object[] = INTERNET_CANDIDATES,
): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/occurrences/${occurrenceId}/candidates`]: () => Response.json({ items }),
  }
}
