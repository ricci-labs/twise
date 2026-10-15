import {
  ACCOUNT_CLASS_BY_KIND,
  accountClassOf,
  entryAmountCents,
  entrySharesOf,
  isSystemAccountKind,
} from '@shared/ledger/ledger/ledger'
import { ACCOUNT_KINDS } from '@shared/ledger/ledger/ledger.constants'
import { describe, expect, it } from 'vitest'

describe('account classes', () => {
  it('gives every kind a class', () => {
    expect(Object.keys(ACCOUNT_CLASS_BY_KIND).sort()).toEqual([...ACCOUNT_KINDS].sort())
  })

  it.each([
    ['checking', 'asset'],
    ['receivable', 'asset'],
    ['credit_card', 'liability'],
    ['payable', 'liability'],
    ['income_category', 'income'],
    ['expense_category', 'expense'],
    ['opening_balance', 'equity'],
  ] as const)('classifies %s as %s', (kind, expected) => {
    expect(accountClassOf(kind)).toBe(expected)
  })
})

describe('system accounts', () => {
  it('are the receivable, the payable and the opening balance', () => {
    const systemKinds = ACCOUNT_KINDS.filter(isSystemAccountKind)
    expect(systemKinds).toEqual(['receivable', 'payable', 'opening_balance'])
  })
})

describe('entryAmountCents', () => {
  it('is the money the entry moved: its positive lines added', () => {
    const splitDinner = [
      { amountCents: 10_000 },
      { amountCents: 10_000 },
      { amountCents: 10_000 },
      { amountCents: -30_000 },
    ]
    expect(entryAmountCents(splitDinner)).toBe(30_000)
    expect(entryAmountCents([])).toBe(0)
  })
})

describe('entrySharesOf', () => {
  it('adds what each contact owes across the installments, never a payment back', () => {
    const owed = (contactId: string, amountCents: number) => ({
      accountKind: 'receivable' as const,
      amountCents,
      contactId,
    })
    expect(
      entrySharesOf([
        { accountKind: 'expense_category', amountCents: 20_000, contactId: null },
        owed('c', 10_000),
        owed('c', 10_000),
        owed('d', 5_000),
        owed('e', -3_000),
        { accountKind: 'credit_card', amountCents: -45_000, contactId: null },
      ]),
    ).toEqual([
      { contactId: 'c', amountCents: 20_000 },
      { contactId: 'd', amountCents: 5_000 },
    ])
  })
})
