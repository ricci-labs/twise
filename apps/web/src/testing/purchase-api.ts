import { accountsAnswers, CARD, CHECKING } from '@web/testing/accounts-api'
import { WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

const PERIOD = { label: '2026-10', start: '2026-10-05', end: '2026-11-04' }

export const TIGHT_ON_CARD = {
  verdict: 'tight',
  verdictReason: { code: 'month_heavily_committed', label: '2026-12', percentOfIncome: 70 },
  committedReferencePercent: 70,
  landsIn: PERIOD,
  affectsCurrentPeriod: true,
  period: {
    ...PERIOD,
    freeToSpendBefore: 234000,
    freeToSpendAfter: 180000,
    dailyAllowanceBefore: 14625,
    dailyAllowanceAfter: 11250,
  },
  card: { accountId: CARD, limitCents: 800000, freeBeforeCents: 800000, freeAfterCents: 476000 },
  account: null,
  coming: [
    ['2026-11', 58, 64],
    ['2026-12', 64, 70],
    ['2027-01', 72, 78],
    ['2027-02', 41, 47],
    ['2027-03', 35, 41],
    ['2027-04', 22, 22],
  ].map(([label, before, after]) => ({
    label,
    committedBefore: 0,
    committedAfter: 0,
    percentOfIncomeBefore: before,
    percentOfIncomeAfter: after,
  })),
  newInsights: [
    {
      code: 'period_heavily_committed',
      severity: 'warning',
      subject: '2026-12',
      values: { percentOfIncome: 70, committedCents: 630000 },
    },
  ],
}

export const OVER_ON_ACCOUNT = {
  ...TIGHT_ON_CARD,
  verdict: 'over',
  verdictReason: { code: 'period_overspent', overspentCents: 92000 },
  period: { ...TIGHT_ON_CARD.period, freeToSpendAfter: -92000, dailyAllowanceAfter: 0 },
  card: null,
  account: { accountId: CHECKING, balanceTodayBeforeCents: 420000, balanceTodayAfterCents: 94000 },
  newInsights: [],
}

export function simulationAnswer(
  impact: unknown = TIGHT_ON_CARD,
  queries: URLSearchParams[] = [],
): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/simulations/purchase`]: (request) => {
      queries.push(new URL(request.url).searchParams)
      return Response.json(impact)
    },
  }
}

const OLD_CARD = '00000000-0000-4000-8000-0000000000c8'

export function archivedCardAnswer(): Record<string, FakeAnswer> {
  const cards: FakeAnswer | undefined = accountsAnswers()[`GET ${BASE}/cards`]
  return {
    [`GET ${BASE}/cards`]: async (request) => {
      const current = (await (await cards?.(request))?.json()) as Record<string, unknown>[]
      const [first] = current
      return Response.json([
        ...current,
        {
          ...first,
          accountId: OLD_CARD,
          name: 'Cartão antigo',
          archivedAt: '2026-09-01T12:00:00.000Z',
        },
      ])
    },
  }
}
