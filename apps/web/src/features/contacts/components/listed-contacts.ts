import type { ContactChannel } from '@web/components/finance/contact-row'
import type {
  Contact,
  ContactBalance,
  ContactSort,
  ContactsSummary,
  ListedContact,
} from '@web/features/contacts/contacts.types'

const SETTLED = {
  owedCents: 0,
  overdueCents: 0,
  nextDueOn: null,
  nextDueCents: 0,
  dueNotChargedCents: 0,
  lastCharge: null,
} as const satisfies Omit<
  ContactBalance,
  'contactId' | 'name' | 'phoneE164' | 'email' | 'nextOpenDueOn'
>

const LOCALE = 'pt-BR'

export function listedContactsOf(
  contacts: readonly Contact[],
  balances: readonly ContactBalance[],
): ListedContact[] {
  const balanceOf = new Map(balances.map((balance) => [balance.contactId, balance]))
  return contacts.map((contact) => {
    const { owedCents, overdueCents, nextDueOn, nextDueCents, dueNotChargedCents, lastCharge } =
      balanceOf.get(contact.id) ?? SETTLED
    const hasDueToCharge = dueNotChargedCents > 0
    return {
      id: contact.id,
      name: contact.name,
      owedCents,
      overdueCents,
      nextDueOn,
      nextDueCents,
      hasDueToCharge,
      chargedOn: !hasDueToCharge && lastCharge ? lastCharge.createdOn : null,
      isOptedOut: contact.isOptedOut,
      isArchived: contact.isArchived,
      channels: channelsOf(contact),
    }
  })
}

export function sortContacts(
  contacts: readonly ListedContact[],
  sort: ContactSort,
): ListedContact[] {
  const byName = (left: ListedContact, right: ListedContact) =>
    left.name.localeCompare(right.name, LOCALE)
  if (sort === 'name') {
    return contacts.toSorted(byName)
  }
  return contacts.toSorted(
    (left, right) =>
      right.overdueCents - left.overdueCents ||
      compareNextDue(left, right) ||
      right.owedCents - left.owedCents ||
      byName(left, right),
  )
}

export function contactsSummaryOf(contacts: readonly ListedContact[]): ContactsSummary {
  const owing = contacts.filter((contact) => contact.owedCents > 0)
  const late = contacts.filter((contact) => contact.overdueCents > 0)
  return {
    owedCents: owing.reduce((total, contact) => total + contact.owedCents, 0),
    owingCount: owing.length,
    overdueCents: late.reduce((total, contact) => total + contact.overdueCents, 0),
    overdueCount: late.length,
  }
}

function channelsOf(contact: Contact): ContactChannel[] {
  return [
    ...(contact.phoneE164 ? (['whatsapp'] as const) : []),
    ...(contact.email ? (['email'] as const) : []),
  ]
}

function compareNextDue(left: ListedContact, right: ListedContact): number {
  if (left.nextDueOn === right.nextDueOn) {
    return 0
  }
  if (!left.nextDueOn) {
    return 1
  }
  if (!right.nextDueOn) {
    return -1
  }
  return left.nextDueOn.localeCompare(right.nextDueOn)
}
