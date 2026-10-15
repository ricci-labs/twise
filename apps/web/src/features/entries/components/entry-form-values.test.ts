import { formInputOf } from '@web/features/entries/components/entry-form-values'
import type { ListedEntry } from '@web/features/entries/entries.types'
import { describe, expect, it } from 'vitest'

function posting(accountId: string, accountKind: string, amountCents: number, extra = {}) {
  return {
    lineNo: 1,
    accountId,
    accountKind,
    amountCents,
    effectiveOn: '2026-10-20',
    invoiceId: null,
    installmentNo: null,
    contactId: null,
    ...extra,
  } as ListedEntry['postings'][number]
}

function entry(overrides: Partial<ListedEntry>): ListedEntry {
  return {
    id: 'e',
    entryType: 'expense',
    occurredOn: '2026-10-20',
    description: 'Jantar',
    notes: 'Aniversário',
    paymentMethod: 'pix',
    installmentCount: 1,
    spentByUserId: 'a',
    createdByUserId: 'a',
    source: 'web',
    replacesEntryId: null,
    amountCents: 24000,
    shares: [{ contactId: 'c', amountCents: 8000 }],
    ownCents: 16000,
    postings: [
      posting('leisure', 'expense_category', 16000),
      posting('receivable', 'receivable', 8000, { contactId: 'c' }),
      posting('checking', 'checking', -24000),
    ],
    ...overrides,
  } as ListedEntry
}

describe('formInputOf', () => {
  it('fills the form of a split expense as it was recorded', () => {
    expect(formInputOf(entry({}))).toMatchObject({
      entryType: 'expense',
      amount: '240,00',
      description: 'Jantar',
      accountId: 'checking',
      categoryId: 'leisure',
      paymentMethod: 'pix',
      spentByUserId: 'a',
      shares: [{ contactId: 'c', amount: '80,00' }],
      notes: 'Aniversário',
      occurredOn: '2026-10-20',
    })
  })

  it('fills a card purchase in progress from the installment it started at', () => {
    const form = formInputOf(
      entry({
        entryType: 'card_purchase',
        installmentCount: 10,
        shares: [],
        postings: [
          posting('house', 'expense_category', 300000),
          posting('card', 'credit_card', -30000, { installmentNo: 4, invoiceId: 'i4' }),
          posting('card', 'credit_card', -30000, { installmentNo: 5, invoiceId: 'i5' }),
        ],
      }),
    )
    expect(form).toMatchObject({
      cardAccountId: 'card',
      installmentCount: 10,
      isInProgress: true,
      firstInstallment: 4,
      categoryId: 'house',
    })
  })

  it('fills a transfer with both accounts, and a negative opening balance', () => {
    expect(
      formInputOf(
        entry({
          entryType: 'transfer',
          shares: [],
          postings: [posting('checking', 'checking', -60000), posting('savings', 'savings', 60000)],
        }),
      ),
    ).toMatchObject({ accountId: 'checking', toAccountId: 'savings' })
    expect(
      formInputOf(
        entry({
          entryType: 'opening_balance',
          shares: [],
          postings: [
            posting('checking', 'checking', -5000),
            posting('ob', 'opening_balance', 5000),
          ],
        }),
      ),
    ).toMatchObject({ accountId: 'checking', isNegative: true })
  })
})
