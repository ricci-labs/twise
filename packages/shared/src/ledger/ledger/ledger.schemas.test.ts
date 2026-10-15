import {
  accountChangeSchema,
  cardChangeSchema,
  entryDetailsChangeSchema,
  entryInputSchema,
  entryListQuerySchema,
  entrySuggestionQuerySchema,
  frequentEntryQuerySchema,
  newAccountSchema,
  newCardSchema,
  upcomingInvoiceQuerySchema,
} from '@shared/ledger/ledger/ledger.schemas'
import { describe, expect, it } from 'vitest'

const ACCOUNT = '01a0d8ce-060b-7dd3-a56f-5995e1676b98'
const CATEGORY = '01a0d8ce-085c-7390-a823-d76b28f1ff07'

const expense = {
  entryType: 'expense',
  occurredOn: '2026-10-05',
  description: '  Mercado  ',
  amountCents: 8750,
  paidFromAccountId: ACCOUNT,
  categoryId: CATEGORY,
}

describe('entryInputSchema', () => {
  it('accepts an expense and trims the description', () => {
    const parsed = entryInputSchema.parse(expense)
    expect(parsed).toMatchObject({
      entryType: 'expense',
      description: 'Mercado',
      amountCents: 8750,
    })
  })

  it('accepts a negative opening balance', () => {
    const parsed = entryInputSchema.safeParse({
      entryType: 'opening_balance',
      occurredOn: '2026-10-01',
      description: 'Saldo inicial',
      balanceCents: -5000,
      accountId: ACCOUNT,
    })
    expect(parsed.success).toBe(true)
  })

  it.each([
    ['a date that does not exist', { occurredOn: '2026-02-30' }],
    ['a blank description', { description: '   ' }],
    ['fractional cents', { amountCents: 87.5 }],
    ['a negative amount', { amountCents: -100 }],
    ['an account id that is not a uuid', { paidFromAccountId: 'checking' }],
    ['an unknown payment method', { paymentMethod: 'cheque' }],
  ])('refuses %s', (_case, change) => {
    expect(entryInputSchema.safeParse({ ...expense, ...change }).success).toBe(false)
  })

  it('refuses an expense without its category', () => {
    const { categoryId: _, ...withoutCategory } = expense
    expect(entryInputSchema.safeParse(withoutCategory).success).toBe(false)
  })

  it('refuses a zero opening balance', () => {
    const zero = {
      entryType: 'opening_balance',
      occurredOn: '2026-10-01',
      description: 'Saldo inicial',
      balanceCents: 0,
      accountId: ACCOUNT,
    }
    expect(entryInputSchema.safeParse(zero).success).toBe(false)
  })
})

describe('entryDetailsChangeSchema', () => {
  it('accepts a new description or new notes', () => {
    expect(entryDetailsChangeSchema.safeParse({ description: 'Feira' }).success).toBe(true)
    expect(entryDetailsChangeSchema.safeParse({ notes: null }).success).toBe(true)
  })

  it('refuses an empty change', () => {
    expect(entryDetailsChangeSchema.safeParse({}).success).toBe(false)
  })
})

describe('newAccountSchema', () => {
  it('accepts a category under a parent and trims the name', () => {
    const parsed = newAccountSchema.parse({
      kind: 'expense_category',
      name: '  Mercado ',
      parentId: ACCOUNT,
      color: '#00AA00',
    })
    expect(parsed).toMatchObject({ name: 'Mercado', parentId: ACCOUNT })
  })

  it('requires the income nature on income categories and only there', () => {
    expect(newAccountSchema.safeParse({ kind: 'income_category', name: 'Salário' }).success).toBe(
      false,
    )
    expect(
      newAccountSchema.safeParse({
        kind: 'income_category',
        name: 'Salário',
        incomeNature: 'fixed',
      }).success,
    ).toBe(true)
    expect(
      newAccountSchema.safeParse({ kind: 'checking', name: 'Conta', incomeNature: 'fixed' })
        .success,
    ).toBe(false)
  })

  it.each(['receivable', 'opening_balance', 'credit_card'])(
    'refuses creating a %s account here',
    (kind) => {
      expect(newAccountSchema.safeParse({ kind, name: 'X' }).success).toBe(false)
    },
  )

  it('refuses a color that is not #rrggbb', () => {
    expect(
      newAccountSchema.safeParse({ kind: 'checking', name: 'X', color: 'green' }).success,
    ).toBe(false)
  })
})

describe('accountChangeSchema', () => {
  it('accepts moving to the root and renaming', () => {
    expect(accountChangeSchema.safeParse({ parentId: null }).success).toBe(true)
    expect(accountChangeSchema.safeParse({ name: 'Feira' }).success).toBe(true)
  })

  it('refuses an empty change', () => {
    expect(accountChangeSchema.safeParse({}).success).toBe(false)
  })
})

describe('newCardSchema', () => {
  it('accepts a card with its cycle', () => {
    const parsed = newCardSchema.safeParse({ name: 'Cartão X', closingDay: 3, dueDay: 10 })
    expect(parsed.success).toBe(true)
  })

  it.each([
    ['a closing day of 0', { closingDay: 0 }],
    ['a due day of 32', { dueDay: 32 }],
    ['a zero limit', { limitCents: 0 }],
  ])('refuses %s', (_case, change) => {
    const card = { name: 'Cartão X', closingDay: 3, dueDay: 10, ...change }
    expect(newCardSchema.safeParse(card).success).toBe(false)
  })
})

describe('cardChangeSchema', () => {
  it('accepts removing the limit and refuses an empty change', () => {
    expect(cardChangeSchema.safeParse({ limitCents: null }).success).toBe(true)
    expect(cardChangeSchema.safeParse({}).success).toBe(false)
  })
})

describe('entryInputSchema for cards', () => {
  const INVOICE = '01a0d8ce-0000-7000-8000-000000000001'

  it('defaults a card purchase to one installment', () => {
    const parsed = entryInputSchema.parse({
      entryType: 'card_purchase',
      occurredOn: '2026-09-15',
      description: 'TV',
      amountCents: 120000,
      cardAccountId: ACCOUNT,
      categoryId: CATEGORY,
    })
    expect(parsed).toMatchObject({ installmentCount: 1, firstInstallment: 1 })
  })

  it('refuses more than 48 installments', () => {
    const parsed = entryInputSchema.safeParse({
      entryType: 'card_purchase',
      occurredOn: '2026-09-15',
      description: 'Carro',
      amountCents: 12000000,
      installmentCount: 49,
      cardAccountId: ACCOUNT,
      categoryId: CATEGORY,
    })
    expect(parsed.success).toBe(false)
  })

  it('accepts an invoice payment without an explicit account', () => {
    const parsed = entryInputSchema.safeParse({
      entryType: 'invoice_payment',
      occurredOn: '2026-10-10',
      description: 'Fatura outubro',
      amountCents: 40000,
      cardAccountId: ACCOUNT,
      invoiceId: INVOICE,
    })
    expect(parsed.success).toBe(true)
  })
})

describe('entryListQuerySchema', () => {
  it('reads query strings and applies the default limit', () => {
    expect(entryListQuerySchema.parse({ from: '2026-10-01', to: '2026-10-31' })).toEqual({
      from: '2026-10-01',
      to: '2026-10-31',
      limit: 50,
    })
    expect(entryListQuerySchema.parse({ limit: '20' }).limit).toBe(20)
  })

  it('reads the search, the types one by one or comma separated, and the shared flag', () => {
    expect(
      entryListQuerySchema.parse({
        q: '  merc ',
        types: 'expense,card_purchase',
        shared: 'true',
      }),
    ).toEqual({ q: 'merc', types: ['expense', 'card_purchase'], shared: true, limit: 50 })
    expect(entryListQuerySchema.parse({ types: ['income', 'transfer'] }).types).toEqual([
      'income',
      'transfer',
    ])
  })

  it('refuses a one-letter search, an unknown type and a shared flag other than true', () => {
    expect(entryListQuerySchema.safeParse({ q: ' a ' }).success).toBe(false)
    expect(entryListQuerySchema.safeParse({ types: 'expense,gift' }).success).toBe(false)
    expect(entryListQuerySchema.safeParse({ types: '' }).success).toBe(false)
    expect(entryListQuerySchema.safeParse({ shared: 'false' }).success).toBe(false)
    expect(entryListQuerySchema.safeParse({ categoryId: 'mercado' }).success).toBe(false)
  })

  it('refuses a period that ends before it starts, a bad date and a limit above 500', () => {
    expect(entryListQuerySchema.safeParse({ from: '2026-10-31', to: '2026-10-01' }).success).toBe(
      false,
    )
    expect(entryListQuerySchema.safeParse({ from: '2026-02-30' }).success).toBe(false)
    expect(entryListQuerySchema.safeParse({ limit: '501' }).success).toBe(false)
  })
})

describe('entrySuggestionQuerySchema', () => {
  it('trims the search and accepts the types that have a category', () => {
    expect(entrySuggestionQuerySchema.parse({ type: 'card_purchase', q: '  merc ' })).toEqual({
      type: 'card_purchase',
      q: 'merc',
    })
  })

  it('refuses a blank search and a type without a category', () => {
    expect(entrySuggestionQuerySchema.safeParse({ type: 'expense', q: '   ' }).success).toBe(false)
    expect(entrySuggestionQuerySchema.safeParse({ type: 'transfer', q: 'Pix' }).success).toBe(false)
  })
})

describe('frequentEntryQuerySchema', () => {
  it('defaults to 8 and reads the limit from the query string', () => {
    expect(frequentEntryQuerySchema.parse({ type: 'income' })).toEqual({ type: 'income', limit: 8 })
    expect(frequentEntryQuerySchema.parse({ type: 'expense', limit: '3' }).limit).toBe(3)
  })

  it('refuses a limit outside 1 to 8', () => {
    expect(frequentEntryQuerySchema.safeParse({ type: 'expense', limit: '0' }).success).toBe(false)
    expect(frequentEntryQuerySchema.safeParse({ type: 'expense', limit: '9' }).success).toBe(false)
  })
})

describe('upcomingInvoiceQuerySchema', () => {
  it('asks for 6 invoices unless told otherwise, up to 24', () => {
    expect(upcomingInvoiceQuerySchema.parse({})).toEqual({ limit: 6 })
    expect(upcomingInvoiceQuerySchema.parse({ limit: '12' }).limit).toBe(12)
    expect(upcomingInvoiceQuerySchema.safeParse({ limit: '0' }).success).toBe(false)
    expect(upcomingInvoiceQuerySchema.safeParse({ limit: '25' }).success).toBe(false)
  })
})
