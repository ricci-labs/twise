import {
  BAKERY,
  CARD,
  CHECKING,
  GROCERIES,
  HOUSE,
  MARKET,
  SAVINGS,
} from '@web/testing/accounts-api'
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

export const RENT_RULE = '00000000-0000-4000-8000-0000000008a1'

export function plannedRule(
  id: string,
  description: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    description,
    entryType: 'expense',
    amountCents: 210000,
    amountIsEstimate: false,
    sourceAccountId: CHECKING,
    categoryAccountId: GROCERIES,
    schedule: {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: 5,
      nthBusinessDay: null,
      weekendRule: 'keep',
      startsOn: '2026-10-05',
      endsOn: null,
    },
    remindDaysBefore: null,
    autoRecord: false,
    nextOn: '2026-11-05',
    nextIsOverdue: false,
    monthlyCents: 210000,
    ...overrides,
  }
}

export const RULES = [
  plannedRule(RENT_RULE, 'Aluguel'),
  plannedRule('00000000-0000-4000-8000-0000000008a2', 'Internet', {
    amountCents: 12000,
    nextOn: '2026-10-18',
    nextIsOverdue: true,
  }),
  plannedRule('00000000-0000-4000-8000-0000000008a3', 'Salário', {
    entryType: 'income',
    amountCents: 620000,
    nextOn: '2026-11-05',
  }),
  plannedRule('00000000-0000-4000-8000-0000000008a4', 'Reserva', {
    entryType: 'transfer',
    categoryAccountId: SAVINGS,
    amountCents: 60000,
  }),
]

export const RULES_SUMMARY = {
  bills: { monthlyCents: 222000, count: 2, includesEstimate: false, includesAveraged: false },
  income: { monthlyCents: 620000, count: 1, leftOutEstimateCents: 0, leftOutEstimateCount: 0 },
  transfers: { monthlyCents: 60000, count: 1 },
}

export function recurrenceFormAnswers(
  workspaceHolidays: readonly string[] = [],
): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/holidays`]: (request) =>
      Response.json({
        national: [],
        workspace: workspaceHolidays
          .filter((onDate) =>
            onDate.startsWith(new URL(request.url).searchParams.get('year') ?? ''),
          )
          .map((onDate, position) => ({
            id: `holiday-${position}`,
            onDate,
            name: 'Feriado local',
          })),
      }),
    [`GET ${BASE}/balances`]: () =>
      Response.json([
        {
          accountId: CHECKING,
          kind: 'checking',
          class: 'asset',
          balanceCents: 280000,
          naturalBalanceCents: 280000,
        },
      ]),
  }
}

export function recurrencesAnswer(
  items: readonly object[] = RULES,
  summary: object = RULES_SUMMARY,
): Record<string, FakeAnswer> {
  return { [`GET ${BASE}/recurrences`]: () => Response.json({ items, summary }) }
}

export const OCTOBER_PERIOD = { label: '2026-10', start: '2026-10-05', end: '2026-11-04' }

export function budgetOverview(overrides: Record<string, unknown> = {}) {
  return {
    today: '2026-10-20',
    period: OCTOBER_PERIOD,
    insights: [],
    metrics: {
      budgetPace: [
        {
          categoryAccountId: GROCERIES,
          limitCents: 120000,
          spentCents: 82000,
          expectedCents: 61935,
          overCents: 0,
          aheadPoints: 16,
          status: 'ahead',
          directCents: 51500,
          children: [
            { categoryAccountId: MARKET, spentCents: 21000 },
            { categoryAccountId: BAKERY, spentCents: 9500 },
          ],
        },
      ],
      budgetTotals: {
        count: 1,
        limitCents: 120000,
        spentCents: 82000,
        expectedCents: 61935,
        usedPercent: 68,
        offPaceCount: 1,
      },
      unbudgetedSpending: [{ categoryAccountId: HOUSE, spentCents: 14500 }],
      categoryAverages: {
        periods: 3,
        lines: [
          { categoryAccountId: GROCERIES, averageCents: 115000 },
          { categoryAccountId: HOUSE, averageCents: 9600 },
        ],
      },
      periodProgress: { total: 31, elapsed: 16, left: 16, elapsedPercent: 52 },
    },
    ...overrides,
  }
}

export function overviewAnswer(overview: object = budgetOverview()): Record<string, FakeAnswer> {
  return { [`GET ${BASE}/overview`]: () => Response.json(overview) }
}

export const RESERVE_GOAL = '00000000-0000-4000-8000-0000000009c1'
export const TRIP_GOAL = '00000000-0000-4000-8000-0000000009c2'

export function plannedGoal(id: string, name: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name,
    targetCents: 1_500_000,
    targetOn: '2027-07-31',
    accountId: CHECKING,
    isReserve: false,
    savedCents: 480_000,
    percent: 32,
    remainingCents: 1_020_000,
    overCents: 0,
    monthlyToTargetCents: 113_400,
    ...overrides,
  }
}

export const GOALS = [
  plannedGoal(RESERVE_GOAL, 'Reserva', {
    accountId: SAVINGS,
    isReserve: true,
    targetCents: 1_800_000,
    targetOn: null,
    savedCents: 1_200_000,
    percent: 67,
    remainingCents: 600_000,
    monthlyToTargetCents: null,
  }),
  plannedGoal(TRIP_GOAL, 'Viagem para o Chile'),
]

export const FILL_TRIP_STEPS = [
  {
    position: 1,
    kind: 'fill_goal',
    goalId: TRIP_GOAL,
    accountId: null,
    percent: null,
    amountCents: null,
  },
  {
    position: 2,
    kind: 'rest',
    goalId: null,
    accountId: CHECKING,
    percent: null,
    amountCents: null,
  },
]

export function goalsAnswer(
  goals: readonly object[] = GOALS,
  steps: readonly object[] = [],
): Record<string, FakeAnswer> {
  const base = budgetOverview()
  return {
    [`GET ${BASE}/goals`]: () => Response.json(goals),
    [`GET ${BASE}/allocation-steps`]: () => Response.json(steps),
    ...overviewAnswer({
      ...base,
      metrics: {
        ...base.metrics,
        reserveCoverage: {
          savedCents: 1_200_000,
          targetCents: 1_800_000,
          percent: 67,
          monthlySpendingCents: 500_000,
          months: 2.4,
        },
      },
    }),
  }
}
