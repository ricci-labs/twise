import {
  contactsSummaryOf,
  listedContactsOf,
  sortContacts,
} from '@web/features/contacts/components/listed-contacts'
import { CONTACT_BALANCES, CONTACT_C, CONTACT_G, CONTACTS } from '@web/testing/contacts-api'
import { describe, expect, it } from 'vitest'

const listed = listedContactsOf(CONTACTS, CONTACT_BALANCES)

describe('listed contacts', () => {
  it('gives a contact with nothing recorded a zero balance and names its channels', () => {
    const archived = listed.find((contact) => contact.id === CONTACT_G)
    const withEmail = listed.find((contact) => contact.name === 'Member D')

    expect(archived).toMatchObject({ owedCents: 0, overdueCents: 0, nextDueOn: null })
    expect(archived?.isArchived).toBe(true)
    expect(withEmail?.channels).toEqual(['whatsapp', 'email'])
    expect(listed.find((contact) => contact.name === 'Member E')?.channels).toEqual(['email'])
  })

  it('offers a charge only for what is due and not charged, and dates the open charge', () => {
    const charged = listedContactsOf(
      CONTACTS,
      CONTACT_BALANCES.map((balance) => ({
        ...balance,
        dueNotChargedCents: 0,
        lastCharge: { chargeId: balance.contactId, createdOn: '2026-10-20', status: 'sent' },
      })),
    )

    expect(
      listed.filter((contact) => contact.hasDueToCharge).map((contact) => contact.name),
    ).toEqual(['Member D'])
    expect(listed.every((contact) => contact.chargedOn === null)).toBe(true)
    expect(charged.find((contact) => contact.name === 'Member D')).toMatchObject({
      hasDueToCharge: false,
      chargedOn: '2026-10-20',
    })
  })

  it('puts the overdue first, then the next due date, then who owes nothing', () => {
    const order = sortContacts(listed, 'overdue').map((contact) => contact.name)

    expect(order).toEqual(['Member D', 'Member C', 'Member E', 'Member G', 'Member F'])
  })

  it('breaks ties on the same due date by the larger amount', () => {
    const sameDay = listed.map((contact) =>
      contact.id === CONTACT_C ? { ...contact, nextDueOn: '2026-11-10' as const } : contact,
    )
    const order = sortContacts(sameDay, 'overdue').map((contact) => contact.name)

    expect(order.slice(0, 3)).toEqual(['Member D', 'Member E', 'Member C'])
  })

  it('sorts by name the way Portuguese reads', () => {
    const names = ['Érica', 'Eduardo', 'Ana']
    const renamed = listed
      .slice(0, names.length)
      .map((contact, position) => ({ ...contact, name: names[position] ?? '' }))
    const sorted = sortContacts(renamed, 'name').map((contact) => contact.name)

    expect(sorted).toEqual(['Ana', 'Eduardo', 'Érica'])
  })

  it('adds up who owes and who is late, leaving credit out', () => {
    expect(contactsSummaryOf(listed)).toEqual({
      owedCents: 84000,
      owingCount: 3,
      overdueCents: 20000,
      overdueCount: 1,
    })
  })
})
