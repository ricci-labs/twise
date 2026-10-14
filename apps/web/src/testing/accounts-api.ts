import { ACCOUNT_COLORS } from '@web/styles/account-colors'
import { WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
export const MEMBER_A = '00000000-0000-4000-8000-0000000000a1'
export const MEMBER_B = '00000000-0000-4000-8000-0000000000b1'
export const CHECKING = '00000000-0000-4000-8000-0000000000c1'
export const SAVINGS = '00000000-0000-4000-8000-0000000000c2'
export const CARD = '00000000-0000-4000-8000-0000000000c3'
export const OLD = '00000000-0000-4000-8000-0000000000c4'
export const NEW_ACCOUNT = '00000000-0000-4000-8000-0000000000c9'

function ledgerAccount(id: string, kind: string, name: string, extra: object = {}) {
  return {
    id,
    parentId: null,
    kind,
    class: kind === 'credit_card' ? 'liability' : 'asset',
    name,
    currency: 'BRL',
    incomeNature: null,
    ownerUserId: null,
    isSystem: false,
    sortOrder: 0,
    color: ACCOUNT_COLORS[0].value,
    icon: 'wallet',
    archivedAt: null,
    ...extra,
  }
}

export const ACCOUNTS = [
  ledgerAccount(CHECKING, 'checking', 'Conta X', { ownerUserId: MEMBER_A }),
  ledgerAccount(SAVINGS, 'savings', 'Poupança'),
  ledgerAccount(CARD, 'credit_card', 'Cartão X', { ownerUserId: MEMBER_B, icon: 'card' }),
  ledgerAccount(OLD, 'checking', 'Conta antiga', { archivedAt: '2026-09-01T12:00:00.000Z' }),
  ledgerAccount('00000000-0000-4000-8000-0000000000c5', 'expense_category', 'Mercado'),
]

const INVOICE = {
  invoiceId: null,
  referenceMonth: '2026-11-01',
  closingOn: '2026-10-25',
  dueOn: '2026-11-04',
  status: 'open',
  totalCents: 195000,
  dueCents: 195000,
}

export function accountsAnswers(overrides: Record<string, FakeAnswer> = {}) {
  return {
    [`GET ${BASE}/accounts`]: () => Response.json(ACCOUNTS),
    [`GET ${BASE}/balances`]: () =>
      Response.json(
        [CHECKING, SAVINGS, CARD, OLD].map((accountId, position) => ({
          accountId,
          kind: 'checking',
          class: 'asset',
          balanceCents: [420000, 1200000, -289000, 0][position],
          naturalBalanceCents: [420000, 1200000, 289000, 0][position],
        })),
      ),
    [`GET ${BASE}/accounts/summary`]: () =>
      Response.json({
        moneyTotalCents: 1620000,
        moneyAccountCount: 2,
        cardsOpenCents: 289000,
        cardCount: 1,
        nextInvoice: { ...INVOICE, cardAccountId: CARD },
      }),
    [`GET ${BASE}/cards`]: () =>
      Response.json([
        {
          accountId: CARD,
          name: 'Cartão X',
          color: null,
          icon: 'card',
          sortOrder: 0,
          archivedAt: null,
          closingDay: 25,
          dueDay: 4,
          purchaseOnClosingDayGoesNext: false,
          limitCents: null,
          holderUserId: MEMBER_B,
          paymentAccountId: CHECKING,
          openCents: 289000,
          limitUsedPercent: null,
          currentInvoice: INVOICE,
        },
      ]),
    [`GET ${BASE}/members`]: () =>
      Response.json([
        { userId: MEMBER_A, displayName: 'Member A' },
        { userId: MEMBER_B, displayName: 'Member B' },
      ]),
    ...overrides,
  }
}

export const TRASHED_ACCOUNT = '00000000-0000-4000-8000-0000000000d1'
export const TRASHED_CHILD = '00000000-0000-4000-8000-0000000000d2'
export const TRASHED_PARENT = '00000000-0000-4000-8000-0000000000d3'

export const TRASH = [
  {
    ...ledgerAccount(TRASHED_ACCOUNT, 'checking', 'Conta antiga'),
    deletedAt: '2026-10-12T15:00:00.000Z',
    deletedByUserId: MEMBER_A,
    deleteReason: 'conta encerrada no banco.',
  },
  {
    ...ledgerAccount(TRASHED_CHILD, 'expense_category', 'Academia', {
      parentId: TRASHED_PARENT,
      icon: null,
    }),
    class: 'expense',
    deletedAt: '2026-10-02T15:00:00.000Z',
    deletedByUserId: MEMBER_B,
    deleteReason: null,
  },
  {
    ...ledgerAccount(TRASHED_PARENT, 'expense_category', 'Saúde', { icon: 'health' }),
    class: 'expense',
    deletedAt: '2026-10-01T15:00:00.000Z',
    deletedByUserId: null,
    deleteReason: null,
  },
]

export const GROCERIES = '00000000-0000-4000-8000-0000000000e1'
export const MARKET = '00000000-0000-4000-8000-0000000000e2'
export const BAKERY = '00000000-0000-4000-8000-0000000000e3'
export const HOUSE = '00000000-0000-4000-8000-0000000000e4'
export const SALARY = '00000000-0000-4000-8000-0000000000e5'

export const CATEGORIES = [
  {
    ...ledgerAccount(GROCERIES, 'expense_category', 'Mercado', { icon: 'groceries' }),
    class: 'expense',
  },
  {
    ...ledgerAccount(MARKET, 'expense_category', 'Feira', { parentId: GROCERIES }),
    class: 'expense',
  },
  {
    ...ledgerAccount(BAKERY, 'expense_category', 'Padaria', { parentId: GROCERIES }),
    class: 'expense',
  },
  { ...ledgerAccount(HOUSE, 'expense_category', 'Casa', { icon: 'house' }), class: 'expense' },
  {
    ...ledgerAccount(SALARY, 'income_category', 'Salário', { icon: 'coin', incomeNature: 'fixed' }),
    class: 'income',
  },
]
