import {
  openItemDetail,
  openItemsByDue,
  openItemTitle,
} from '@web/features/contacts/components/contact-detail-view'
import type { ContactOpenItem } from '@web/features/contacts/contacts.types'
import { describe, expect, it } from 'vitest'

function item(
  postingId: string,
  effectiveOn: string,
  installment: number | null = null,
  split: Partial<ContactOpenItem> = {},
) {
  return {
    postingId,
    description: postingId,
    installmentNo: installment,
    installmentCount: installment ? 3 : 1,
    effectiveOn,
    amountCents: 1000,
    remainingCents: 1000,
    inChargeId: null,
    inChargeCreatedOn: null,
    paidFrom: 'Cartão X',
    entryAmountCents: 2000,
    partCount: 2,
    isEvenSplit: true,
    ...split,
  } satisfies ContactOpenItem
}

describe('openItemsByDue', () => {
  it('puts what falls due up to today with the overdue and the rest to come', () => {
    const items = [item('a', '2026-10-10'), item('b', '2026-10-20'), item('c', '2026-11-10')]

    const { overdue, upcoming } = openItemsByDue(items, '2026-10-20')

    expect(overdue.map(({ postingId }) => postingId)).toEqual(['a', 'b'])
    expect(upcoming.map(({ postingId }) => postingId)).toEqual(['c'])
  })
})

describe('openItemTitle', () => {
  it('adds the installment to the description', () => {
    expect(openItemTitle(item('TV da sala', '2026-11-10', 2))).toBe('TV da sala (parcela 2/3)')
    expect(openItemTitle(item('Mercado', '2026-11-10'))).toBe('Mercado')
  })
})

describe('openItemDetail', () => {
  it('names the card and the half of an even split in two', () => {
    expect(openItemDetail(item('a', '2026-10-10'))).toMatch(/^Cartão X · metade de R\$\s20,00$/)
  })

  it('counts the parts of an even split in more', () => {
    expect(openItemDetail(item('a', '2026-10-10', null, { partCount: 3 }))).toBe(
      'Cartão X · 1 de 3 partes',
    )
  })

  it('says it is a part of the total when the split is uneven', () => {
    expect(openItemDetail(item('a', '2026-10-10', null, { isEvenSplit: false }))).toMatch(
      /^Cartão X · parte de R\$\s20,00$/,
    )
  })

  it('names only the card for an installment or what the contact owes alone', () => {
    expect(openItemDetail(item('a', '2026-11-10', 2))).toBe('Cartão X')
    expect(openItemDetail(item('a', '2026-10-10', null, { partCount: 1 }))).toBe('Cartão X')
  })

  it('says nothing when no account paid and nothing was split', () => {
    expect(openItemDetail(item('a', '2026-10-10', null, { paidFrom: null, partCount: 1 }))).toBe('')
  })
})
