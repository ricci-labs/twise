import { entryRowOf } from '@web/features/entries/components/entry-row-view'
import type { LedgerAccount, ListedEntry } from '@web/features/entries/entries.types'
import { describe, expect, it } from 'vitest'

const ME = 'user-a'
const OTHER = 'user-b'

function account(id: string, kind: string, name: string, extra: Partial<LedgerAccount> = {}) {
  return {
    id,
    parentId: null,
    kind,
    class: 'asset',
    name,
    currency: 'BRL',
    incomeNature: null,
    ownerUserId: null,
    isSystem: false,
    sortOrder: 0,
    color: null,
    icon: null,
    archivedAt: null,
    ...extra,
  } as LedgerAccount
}

const ACCOUNTS = new Map(
  [
    account('checking', 'checking', 'Conta X'),
    account('savings', 'savings', 'Poupança'),
    account('card', 'credit_card', 'Cartão X'),
    account('groceries', 'expense_category', 'Mercado', { icon: 'groceries' }),
    account('market', 'expense_category', 'Feira', { parentId: 'groceries' }),
  ].map((item) => [item.id, item]),
)

const CONTEXT = {
  accounts: ACCOUNTS,
  memberNames: new Map([[OTHER, 'Member B']]),
  currentUserId: ME,
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
    id: 'entry',
    entryType: 'expense',
    occurredOn: '2026-10-20',
    description: 'Mercado da semana',
    notes: null,
    paymentMethod: 'pix',
    installmentCount: 1,
    spentByUserId: ME,
    createdByUserId: ME,
    source: 'web',
    replacesEntryId: null,
    amountCents: 8640,
    postings: [],
    ...overrides,
  } as ListedEntry
}

describe('entryRowOf', () => {
  it('reads an expense on a subcategory, with the parent drawing, as money out', () => {
    const row = entryRowOf(
      entry({ postings: [posting('market', 8640), posting('checking', -8640)] }),
      CONTEXT,
    )
    expect(row).toMatchObject({
      detail: 'Mercado › Feira · Conta X',
      art: { name: 'Mercado', icon: 'groceries' },
      direction: 'out',
      isShared: false,
    })
  })

  it('names the card of a purchase and who spent it when it was someone else', () => {
    const row = entryRowOf(
      entry({
        entryType: 'card_purchase',
        installmentCount: 3,
        spentByUserId: OTHER,
        postings: [posting('groceries', 100000), posting('card', -100000)],
      }),
      CONTEXT,
    )
    expect(row.detail).toBe('Mercado · Cartão X · por Member B')
    expect(row.installmentCount).toBe(3)
  })

  it('draws a transfer from one account to the other, neutral', () => {
    const row = entryRowOf(
      entry({
        entryType: 'transfer',
        spentByUserId: null,
        postings: [posting('checking', -60000), posting('savings', 60000)],
      }),
      CONTEXT,
    )
    expect(row).toMatchObject({
      detail: 'Conta X → Poupança',
      art: { icon: 'transfer' },
      direction: 'neutral',
    })
  })

  it('reads a contact paying back as money in, and a split as shared', () => {
    const settlement = entryRowOf(
      entry({
        entryType: 'settlement',
        spentByUserId: null,
        postings: [posting('checking', 12000), posting('receivable', -12000, { contactId: 'c' })],
      }),
      CONTEXT,
    )
    expect(settlement).toMatchObject({ detail: 'Recebimento · Conta X', direction: 'in' })

    const split = entryRowOf(
      entry({
        postings: [
          posting('groceries', 5000),
          posting('receivable', 5000, { contactId: 'c' }),
          posting('checking', -10000),
        ],
      }),
      CONTEXT,
    )
    expect(split.isShared).toBe(true)
  })
})
