import { demoPeriodsOf } from '@financas/shared'
import {
  ACCOUNTS,
  CARD,
  CATEGORIES,
  CHECKING,
  GROCERIES,
  MARKET,
  SALARY,
  SAVINGS,
} from '@web/testing/accounts-api'
import { MEMBER_A_ID, MEMBER_B_ID, WORKSPACE_ID } from '@web/testing/fake-api'
import type { EntryLine, FakeAnswer } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const KIND_OF: Readonly<Record<string, string>> = Object.fromEntries(
  [...ACCOUNTS, ...CATEGORIES].map((account) => [account.id, account.kind]),
)

export const ENTRY_ACCOUNTS = [...ACCOUNTS, ...CATEGORIES]

export function listedEntry(
  id: string,
  occurredOn: string,
  description: string,
  entryType: string,
  lines: readonly EntryLine[],
  extra: object = {},
) {
  return {
    id,
    entryType,
    occurredOn,
    description,
    notes: null,
    paymentMethod: null,
    installmentCount: 1,
    spentByUserId: MEMBER_A_ID,
    createdByUserId: MEMBER_A_ID,
    source: 'web',
    replacesEntryId: null,
    amountCents: lines.reduce((total, [, amount]) => total + Math.max(amount, 0), 0),
    postings: lines.map(([accountId, amountCents], index) => ({
      lineNo: index + 1,
      accountId,
      accountKind: KIND_OF[accountId] ?? 'receivable',
      amountCents,
      effectiveOn: occurredOn,
      invoiceId: null,
      installmentNo: null,
      contactId: null,
    })),
    ...extra,
  }
}

export const OCTOBER_ENTRIES = [
  listedEntry('e1', '2026-10-20', 'Mercado da semana', 'expense', [
    [MARKET, 8640],
    [CHECKING, -8640],
  ]),
  listedEntry(
    'e2',
    '2026-10-20',
    'Tênis de corrida',
    'card_purchase',
    [
      [GROCERIES, 100000],
      [CARD, -100000],
    ],
    { installmentCount: 3 },
  ),
  listedEntry(
    'e3',
    '2026-10-19',
    'Farmácia',
    'expense',
    [
      [GROCERIES, 5490],
      [CHECKING, -5490],
    ],
    { spentByUserId: MEMBER_B_ID },
  ),
  listedEntry(
    'e4',
    '2026-10-10',
    'Reserva',
    'transfer',
    [
      [CHECKING, -60000],
      [SAVINGS, 60000],
    ],
    { spentByUserId: null },
  ),
  listedEntry(
    'e5',
    '2026-10-05',
    'Salário',
    'income',
    [
      [CHECKING, 620000],
      [SALARY, -620000],
    ],
    { spentByUserId: null },
  ),
]

export const OCTOBER_SUMMARY = { outCents: 114130, inCents: 620000, count: 5 }

export function entriesListAnswers(overrides: Record<string, FakeAnswer> = {}) {
  return {
    [`GET ${BASE}/periods`]: (request: Request) =>
      Response.json(demoPeriodsOf(Number(new URL(request.url).searchParams.get('year') ?? 2026))),
    [`GET ${BASE}/accounts`]: () => Response.json(ENTRY_ACCOUNTS),
    [`GET ${BASE}/entries`]: () => Response.json({ items: OCTOBER_ENTRIES, nextCursor: null }),
    [`GET ${BASE}/entries/summary`]: () => Response.json(OCTOBER_SUMMARY),
    ...overrides,
  } satisfies Record<string, FakeAnswer>
}
