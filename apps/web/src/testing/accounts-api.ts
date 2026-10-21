import { type InvoiceLineFacts, invoiceLinePageOf, invoiceLineQuerySchema } from '@financas/shared'
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
const SHOPPING = '00000000-0000-4000-8000-0000000000c5'

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
  ledgerAccount(SHOPPING, 'expense_category', 'Mercado'),
]

export const OPEN_INVOICE = '00000000-0000-4000-8000-0000000000f2'
export const PAID_INVOICE = '00000000-0000-4000-8000-0000000000f1'
export const FUTURE_INVOICE = '00000000-0000-4000-8000-0000000000f3'

const INVOICE = {
  invoiceId: OPEN_INVOICE,
  referenceMonth: '2026-11',
  closingOn: '2026-10-25',
  dueOn: '2026-11-04',
  status: 'open',
  totalCents: 195000,
  dueCents: 195000,
}

function storedInvoice(
  invoiceId: string,
  referenceMonth: string,
  closingOn: string,
  amounts: { total: number; paid: number; fronted: number },
) {
  return {
    invoiceId,
    referenceMonth,
    closingOn,
    dueOn: `${referenceMonth}-04`,
    status: 'closed',
    totalCents: amounts.total,
    paidCents: amounts.paid,
    dueCents: amounts.total - amounts.paid,
    frontedCents: amounts.fronted,
    ownCents: amounts.total - amounts.fronted,
  }
}

const CARD_INVOICES = [
  storedInvoice(PAID_INVOICE, '2026-10', '2026-09-25', {
    total: 162000,
    paid: 162000,
    fronted: 12000,
  }),
  storedInvoice(OPEN_INVOICE, '2026-11', '2026-10-25', { total: 195000, paid: 0, fronted: 24000 }),
  storedInvoice(FUTURE_INVOICE, '2026-12', '2026-11-25', { total: 64000, paid: 0, fronted: 0 }),
]

function invoiceLine(entryId: string, occurredOn: string, description: string, extra: object = {}) {
  return {
    entryId,
    entryType: 'expense',
    occurredOn,
    description,
    installmentNo: null,
    installmentCount: 1,
    amountCents: 10000,
    frontedCents: 0,
    counterpartAccountId: SHOPPING,
    ...extra,
  }
}

const OPEN_LINES = [
  invoiceLine('00000000-0000-4000-8000-000000000101', '2026-10-24', 'Mercado da semana', {
    amountCents: 8640,
  }),
  invoiceLine('00000000-0000-4000-8000-000000000102', '2026-10-22', 'Tênis de corrida', {
    amountCents: 33334,
    installmentNo: 1,
    installmentCount: 3,
  }),
  invoiceLine('00000000-0000-4000-8000-000000000103', '2026-10-20', 'Jantar de aniversário', {
    amountCents: 24000,
    frontedCents: 16000,
  }),
]

const PAID_LINES = [
  invoiceLine('00000000-0000-4000-8000-000000000104', '2026-10-03', 'Pagamento da fatura', {
    entryType: 'invoice_payment',
    amountCents: -162000,
    counterpartAccountId: CHECKING,
  }),
  invoiceLine('00000000-0000-4000-8000-000000000105', '2026-09-24', 'Mercado da semana'),
]

export function invoiceLinesAnswer(lines: readonly InvoiceLineFacts[]): FakeAnswer {
  return (request) => {
    const query = invoiceLineQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    )
    return Response.json(invoiceLinePageOf(lines, query))
  }
}

export function manyInvoiceLines(count: number) {
  return Array.from({ length: count }, (_, position) =>
    invoiceLine(
      `00000000-0000-4000-8000-0000000002${String(position).padStart(2, '0')}`,
      `2026-10-${String((position % 28) + 1).padStart(2, '0')}`,
      `Compra ${position + 1}`,
    ),
  )
}

export const MEAL_VOUCHER = '00000000-0000-4000-8000-0000000000c9'

export function withMealVoucher(): Record<string, FakeAnswer> {
  return {
    [`GET ${BASE}/accounts`]: () =>
      Response.json([...ACCOUNTS, ledgerAccount(MEAL_VOUCHER, 'benefit', 'VR')]),
    [`GET ${BASE}/balances`]: () =>
      Response.json([
        {
          accountId: MEAL_VOUCHER,
          kind: 'benefit',
          class: 'asset',
          balanceCents: 64000,
          naturalBalanceCents: 64000,
        },
      ]),
  }
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
        benefitTotalCents: 0,
        benefitAccountCount: 0,
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
          createdAt: '2026-08-20T12:00:00.000Z',
          closingDay: 25,
          dueDay: 4,
          purchaseOnClosingDayGoesNext: false,
          limitCents: 600000,
          holderUserId: MEMBER_B,
          paymentAccountId: CHECKING,
          openCents: 289000,
          limitUsedPercent: 48,
          currentInvoice: INVOICE,
        },
      ]),
    [`GET ${BASE}/cards/invoices/upcoming`]: () =>
      Response.json([
        { ...INVOICE, cardAccountId: CARD },
        {
          cardAccountId: CARD,
          invoiceId: null,
          referenceMonth: '2026-12',
          closingOn: '2026-11-25',
          dueOn: '2026-12-04',
          status: 'future',
          totalCents: 0,
          dueCents: 0,
        },
      ]),
    [`GET ${BASE}/cards/${CARD}/invoices`]: () => Response.json(CARD_INVOICES),
    [`GET ${BASE}/cards/${CARD}/invoices/${OPEN_INVOICE}/lines`]: invoiceLinesAnswer(OPEN_LINES),
    [`GET ${BASE}/cards/${CARD}/invoices/${PAID_INVOICE}/lines`]: invoiceLinesAnswer(PAID_LINES),
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
