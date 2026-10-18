import {
  openItemDetail,
  openItemsByDue,
} from '@web/features/contacts/components/contact-detail-view'
import type { ContactOpenItem } from '@web/features/contacts/contacts.types'
import { describe, expect, it } from 'vitest'

function item(postingId: string, effectiveOn: string, installment: number | null = null) {
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

describe('openItemDetail', () => {
  it('names the installment and says nothing for a single payment', () => {
    expect(openItemDetail(item('a', '2026-11-10', 2))).toBe('Parcela 2/3')
    expect(openItemDetail(item('b', '2026-11-10'))).toBe('')
  })
})
