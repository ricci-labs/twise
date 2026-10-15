import { filterChipsOf, withoutChip } from '@web/features/entries/components/entries-filters-view'
import type { LedgerAccount } from '@web/features/entries/entries.types'
import { describe, expect, it } from 'vitest'

function account(id: string, name: string, parentId: string | null = null) {
  return { id, name, parentId } as LedgerAccount
}

const NAMES = {
  accounts: new Map(
    [
      account('card', 'Cartão X'),
      account('groceries', 'Mercado'),
      account('market', 'Feira', 'groceries'),
    ].map((item) => [item.id, item]),
  ),
  members: new Map([['user-b', 'Member B']]),
}

describe('filterChipsOf', () => {
  it('names each active filter, a parent category with its subcategories', () => {
    expect(
      filterChipsOf(
        {
          types: ['card_purchase', 'expense'],
          accountId: 'card',
          categoryId: 'groceries',
          spentBy: 'user-b',
          shared: true,
        },
        NAMES,
      ).map((chip) => chip.label),
    ).toEqual([
      'Compra no cartão',
      'Despesa',
      'Cartão X',
      'Mercado e subcategorias',
      'Member B',
      'Divididos com contatos',
    ])
    expect(filterChipsOf({ categoryId: 'market' }, NAMES).map((chip) => chip.label)).toEqual([
      'Feira',
    ])
  })
})

describe('withoutChip', () => {
  it('takes one type out, and a whole filter off', () => {
    const search = { types: ['card_purchase' as const, 'expense' as const], accountId: 'card' }
    expect(withoutChip(search, 'types:expense')).toEqual({ types: ['card_purchase'] })
    expect(withoutChip({ types: ['expense'] }, 'types:expense')).toEqual({ types: undefined })
    expect(withoutChip(search, 'accountId')).toEqual({ accountId: undefined })
  })
})
