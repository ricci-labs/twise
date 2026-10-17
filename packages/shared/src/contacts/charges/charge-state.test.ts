import {
  contactChargeState,
  markedOpenItems,
  upcomingItems,
} from '@shared/contacts/charges/charge-state'
import type { ChargeMark, ChargeSummary } from '@shared/contacts/charges/charge-state.types'
import type { ChargeableItem } from '@shared/contacts/charges/charges.types'
import { describe, expect, it } from 'vitest'

const TODAY = '2026-10-15'

function item(postingId: string, effectiveOn: string, installmentNo: number): ChargeableItem {
  return {
    postingId,
    description: 'TV',
    installmentNo,
    installmentCount: 3,
    effectiveOn,
    amountCents: 10_000,
  }
}

const TV = [item('p1', '2026-10-10', 1), item('p2', '2026-11-10', 2), item('p3', '2026-12-10', 3)]

const IN_CHARGE_OF_OCT_12: ChargeMark = { chargeId: 'c1', createdOn: '2026-10-12' }

function charge(chargeId: string, status: ChargeSummary['status']): ChargeSummary {
  return { chargeId, createdOn: '2026-10-12', status }
}

describe('markedOpenItems', () => {
  it('keeps the items already in an open charge and says which one', () => {
    const items = markedOpenItems(TV, 4_000, {
      until: '2026-11-30',
      marks: new Map([['p1', IN_CHARGE_OF_OCT_12]]),
      includeCharged: true,
    })
    expect(
      items.map((open) => [
        open.postingId,
        open.remainingCents,
        open.inChargeId,
        open.inChargeCreatedOn,
      ]),
    ).toEqual([
      ['p1', 6_000, 'c1', '2026-10-12'],
      ['p2', 10_000, null, null],
    ])
  })

  it('leaves the charged items out unless asked for them, as a new charge would', () => {
    const items = markedOpenItems(TV, 0, {
      until: '2026-12-31',
      marks: new Map([['p1', IN_CHARGE_OF_OCT_12]]),
      includeCharged: false,
    })
    expect(items.map((open) => open.postingId)).toEqual(['p2', 'p3'])
  })

  it('lists every future installment for a far date', () => {
    const items = markedOpenItems(TV, 0, {
      until: '9999-12-31',
      marks: new Map(),
      includeCharged: true,
    })
    expect(items.map((open) => open.postingId)).toEqual(['p1', 'p2', 'p3'])
  })
})

describe('contactChargeState', () => {
  it('sums what is due and not charged yet, and names the next due date to charge', () => {
    const state = contactChargeState([...TV, item('p0', TODAY, 1)], 4_000, {
      today: TODAY,
      marks: new Map(),
      chargesNewestFirst: [],
    })
    expect(state).toEqual({
      dueNotChargedCents: 16_000,
      nextOpenDueOn: '2026-11-10',
      lastCharge: null,
    })
  })

  it('counts nothing due once it is in an open charge, and names that charge', () => {
    const state = contactChargeState(TV, 0, {
      today: TODAY,
      marks: new Map([['p1', IN_CHARGE_OF_OCT_12]]),
      chargesNewestFirst: [charge('c2', 'paid'), charge('c1', 'sent'), charge('c0', 'draft')],
    })
    expect(state).toEqual({
      dueNotChargedCents: 0,
      nextOpenDueOn: '2026-11-10',
      lastCharge: charge('c1', 'sent'),
    })
  })

  it('skips a future installment already charged ahead for the next due date', () => {
    const state = contactChargeState(TV, 10_000, {
      today: TODAY,
      marks: new Map([['p2', IN_CHARGE_OF_OCT_12]]),
      chargesNewestFirst: [charge('c1', 'partially_paid')],
    })
    expect(state.nextOpenDueOn).toBe('2026-12-10')
    expect(state.lastCharge?.status).toBe('partially_paid')
  })

  it('has no last charge when every charge is paid or cancelled', () => {
    const state = contactChargeState(TV, 30_000, {
      today: TODAY,
      marks: new Map(),
      chargesNewestFirst: [charge('c2', 'cancelled'), charge('c1', 'paid')],
    })
    expect(state).toEqual({ dueNotChargedCents: 0, nextOpenDueOn: null, lastCharge: null })
  })
})

describe('upcomingItems', () => {
  it('lists what falls due after today across contacts, soonest first, up to the limit', () => {
    const upcoming = upcomingItems(
      [
        {
          contactId: 'm',
          contactName: 'Contact M',
          items: [item('m1', '2026-11-10', 1), item('m2', '2027-01-10', 2)],
          paidCents: 0,
        },
        { contactId: 'j', contactName: 'Contact J', items: TV, paidCents: 13_000 },
      ],
      { today: TODAY, limit: 3 },
    )
    expect(
      upcoming.map((due) => [due.contactName, due.postingId, due.dueOn, due.remainingCents]),
    ).toEqual([
      ['Contact J', 'p2', '2026-11-10', 7_000],
      ['Contact M', 'm1', '2026-11-10', 10_000],
      ['Contact J', 'p3', '2026-12-10', 10_000],
    ])
  })

  it('leaves out what is due today and what is already paid', () => {
    const upcoming = upcomingItems(
      [
        { contactId: 'j', contactName: 'Contact J', items: [item('p0', TODAY, 1)], paidCents: 0 },
        {
          contactId: 'm',
          contactName: 'Contact M',
          items: [item('m2', '2026-11-10', 2)],
          paidCents: 10_000,
        },
      ],
      { today: TODAY, limit: 5 },
    )
    expect(upcoming).toEqual([])
  })
})
