import { entrySplitOf } from '@shared/ledger/shares/entry-split'
import type { SplitPosting } from '@shared/ledger/shares/entry-split.types'
import { describe, expect, it } from 'vitest'

const CARD: SplitPosting = {
  accountKind: 'credit_card',
  accountName: 'Card X',
  amountCents: -24_000,
  contactId: null,
}

function category(amountCents: number): SplitPosting {
  return { accountKind: 'expense_category', accountName: 'Mercado', amountCents, contactId: null }
}

function share(contactId: string, amountCents: number): SplitPosting {
  return { accountKind: 'receivable', accountName: 'A receber', amountCents, contactId }
}

describe('entrySplitOf', () => {
  it('names where the money came from and the even half', () => {
    expect(entrySplitOf([CARD, category(12_000), share('contact-a', 12_000)])).toEqual({
      paidFrom: 'Card X',
      entryAmountCents: 24_000,
      partCount: 2,
      isEvenSplit: true,
    })
  })

  it('counts you and each contact as a part, the rounding cents still even', () => {
    const split = entrySplitOf([
      { ...CARD, amountCents: -10_000 },
      category(3334),
      share('contact-a', 3333),
      share('contact-b', 3333),
    ])
    expect(split).toMatchObject({ partCount: 3, isEvenSplit: true })
  })

  it('tells an uneven split, even when the parts are a few cents apart', () => {
    expect(entrySplitOf([CARD, category(18_000), share('contact-a', 6000)])).toMatchObject({
      partCount: 2,
      isEvenSplit: false,
    })
    const nearlyEven = [{ ...CARD, amountCents: -10_000 }, category(5001), share('contact-a', 4999)]
    expect(entrySplitOf(nearlyEven).isEvenSplit).toBe(false)
  })

  it('adds up the installments of each contact', () => {
    const split = entrySplitOf([
      { ...CARD, amountCents: -12_000 },
      { ...CARD, amountCents: -12_000 },
      category(12_000),
      share('contact-a', 6000),
      share('contact-a', 6000),
    ])
    expect(split).toMatchObject({ entryAmountCents: 24_000, partCount: 2, isEvenSplit: true })
  })

  it('has one part when the contact owes it all', () => {
    expect(entrySplitOf([CARD, share('contact-a', 24_000)])).toMatchObject({
      partCount: 1,
      isEvenSplit: true,
    })
  })

  it('names a money account, and nothing when no account paid', () => {
    const fromAccount: SplitPosting = { ...CARD, accountKind: 'checking', accountName: 'Account Y' }
    expect(entrySplitOf([fromAccount, share('contact-a', 24_000)]).paidFrom).toBe('Account Y')
    expect(entrySplitOf([share('contact-a', 100), category(-100)]).paidFrom).toBeNull()
  })
})
