import type { IsoDate } from '@financas/shared'
import { entryDetailOf } from '@web/features/entries/components/entry-detail-view'
import type {
  CardInvoice,
  CardSummary,
  LedgerAccount,
  ListedEntry,
} from '@web/features/entries/entries.types'
import { describe, expect, it } from 'vitest'

function account(id: string, kind: string, name: string, icon: string | null = null) {
  return { id, kind, name, icon, parentId: null } as LedgerAccount
}

const ACCOUNTS = new Map(
  [
    account('checking', 'checking', 'Conta X', 'wallet'),
    account('savings', 'savings', 'Poupança', 'piggy-bank'),
    account('card', 'credit_card', 'Cartão X', 'card'),
    account('leisure', 'expense_category', 'Lazer', 'leisure'),
  ].map((item) => [item.id, item]),
)

function invoice(id: string, closingOn: string, dueOn: string, dueCents = 33334): CardInvoice {
  return {
    invoiceId: id,
    referenceMonth: dueOn.slice(0, 7),
    closingOn,
    dueOn,
    status: 'open',
    totalCents: 33334,
    paidCents: 0,
    dueCents,
    frontedCents: 0,
    ownCents: 33334,
  } as CardInvoice
}

const INVOICES = new Map(
  [
    invoice('nov', '2026-10-25', '2026-11-04'),
    invoice('dec', '2026-11-25', '2026-12-04'),
    invoice('jan', '2026-12-25', '2027-01-04'),
  ].map((item) => [item.invoiceId, item]),
)

const CONTEXT = {
  accounts: ACCOUNTS,
  memberNames: new Map([['a', 'Member A']]),
  contactNames: new Map([['c', 'Member C']]),
  invoices: INVOICES,
  card: { closingDay: 25, dueDay: 4, purchaseOnClosingDayGoesNext: false } as CardSummary,
  today: '2026-10-20' as IsoDate,
}

function posting(accountId: string, amountCents: number, extra = {}) {
  return {
    lineNo: 1,
    accountId,
    accountKind: ACCOUNTS.get(accountId)?.kind ?? 'receivable',
    amountCents,
    effectiveOn: '2026-10-20',
    invoiceId: null,
    installmentNo: null,
    contactId: null,
    ...extra,
  }
}

function entry(overrides: Partial<ListedEntry>): ListedEntry {
  return {
    id: 'e',
    entryType: 'card_purchase',
    occurredOn: '2026-10-20',
    description: 'Tênis de corrida',
    notes: null,
    paymentMethod: 'credit',
    installmentCount: 3,
    spentByUserId: 'a',
    createdByUserId: 'a',
    source: 'web',
    replacesEntryId: null,
    amountCents: 100000,
    shares: [],
    ownCents: 100000,
    postings: [],
    ...overrides,
  } as ListedEntry
}

const TENIS = entry({
  postings: [
    posting('leisure', 100000),
    posting('card', -33334, { invoiceId: 'nov', installmentNo: 1 }),
    posting('card', -33333, { invoiceId: 'dec', installmentNo: 2 }),
    posting('card', -33333, { invoiceId: 'jan', installmentNo: 3 }),
  ],
})

describe('entryDetailOf', () => {
  it('reads a purchase in installments with its invoices, month by month', () => {
    const view = entryDetailOf(TENIS, CONTEXT)

    expect(view.header.typeLabel).toBe('Compra no cartão')
    expect(view.header.detail.replace(/\s/g, ' ')).toBe('3× de R$ 333,34 · ter, 20 out 2026')
    expect(view.rows.map((row) => [row.label, row.value])).toEqual([
      ['Cartão', { kind: 'art', name: 'Cartão X', icon: 'card' }],
      ['Categoria', { kind: 'art', name: 'Lazer', icon: 'leisure' }],
      ['Forma de pagamento', { kind: 'text', text: 'Crédito' }],
      ['Quem gastou', { kind: 'member', name: 'Member A' }],
      ['Registrado por', { kind: 'text', text: 'Member A, pela web' }],
    ])
    expect(
      view.installments.rows.map((row) => [row.number, row.month, row.due, row.status.label]),
    ).toEqual([
      ['1/3', 'Novembro', 'vence 04/11', 'Aberta'],
      ['2/3', 'Dezembro', 'vence 04/12', 'Futura'],
      ['3/3', 'Janeiro', 'vence 04/01/27', 'Futura'],
    ])
    expect(view.isOnClosedInvoice).toBe(false)
  })

  it('knows an entry on a closed invoice and names the invoice of a purchase in one go', () => {
    const view = entryDetailOf(
      entry({
        installmentCount: 1,
        description: 'Jantar de aniversário',
        shares: [{ contactId: 'c', amountCents: 8000 }],
        ownCents: 16000,
        amountCents: 24000,
        postings: [
          posting('leisure', 16000),
          posting('receivable', 8000, { contactId: 'c' }),
          posting('card', -24000, { invoiceId: 'nov', installmentNo: 1 }),
        ],
      }),
      { ...CONTEXT, today: '2026-10-28' as IsoDate },
    )

    expect(view.header.detail).toBe('À vista · ter, 20 out 2026')
    expect(view.rows[1]).toMatchObject({
      label: 'Fatura',
      value: { kind: 'invoice', text: 'novembro, vence 04/11', cardId: 'card', invoiceId: 'nov' },
    })
    expect(view.shares).toEqual([{ key: 'c', name: 'Member C', amountCents: 8000 }])
    expect(view.isOnClosedInvoice).toBe(true)
    expect(view.locked?.title.replace(/\s/g, ' ')).toBe('R$ 240,00 · Cartão X')
    expect(view.locked?.reason).toBe(
      'A 1ª parcela está na fatura de novembro, que já fechou. Valor, data, cartão e parcelas ficam como estão.',
    )
  })

  it('draws a transfer from one account to the other, with its note', () => {
    const view = entryDetailOf(
      entry({
        entryType: 'transfer',
        installmentCount: 1,
        paymentMethod: null,
        postings: [posting('checking', -60000), posting('savings', 60000)],
      }),
      CONTEXT,
    )

    expect(view.transfer).toEqual({
      from: { name: 'Conta X', icon: 'wallet' },
      to: { name: 'Poupança', icon: 'piggy-bank' },
    })
    expect(view.note).toMatch(/não conta como gasto/)
    expect(view.rows.map((row) => row.label)).toEqual(['Registrado por'])
  })
})
