import { WORKSPACE_ID } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

export const CONTACT_C = '00000000-0000-4000-8000-0000000000e3'
export const CONTACT_D = '00000000-0000-4000-8000-0000000000e4'
export const CONTACT_E = '00000000-0000-4000-8000-0000000000e5'
export const CONTACT_F = '00000000-0000-4000-8000-0000000000e6'
export const CONTACT_G = '00000000-0000-4000-8000-0000000000e7'

const PHONE = '+5511999990000'

function contact(id: string, name: string, extra: object = {}) {
  return {
    id,
    name,
    phoneE164: PHONE,
    email: null,
    pixKey: null,
    notes: null,
    isOptedOut: false,
    isArchived: false,
    ...extra,
  }
}

export const CONTACTS = [
  contact(CONTACT_C, 'Member C'),
  contact(CONTACT_D, 'Member D', { email: 'member.d@exemplo.com' }),
  contact(CONTACT_E, 'Member E', {
    phoneE164: null,
    email: 'member.e@exemplo.com',
    isOptedOut: true,
  }),
  contact(CONTACT_F, 'Member F'),
  contact(CONTACT_G, 'Member G', { isArchived: true }),
]

function balance(contactId: string, owedCents: number, extra: object = {}) {
  const { name, phoneE164, email } = CONTACTS.find((item) => item.id === contactId) ?? {
    name: '',
    phoneE164: null,
    email: null,
  }
  return {
    contactId,
    owedCents,
    overdueCents: 0,
    nextDueOn: null,
    nextDueCents: 0,
    dueNotChargedCents: 0,
    nextOpenDueOn: null,
    lastCharge: null,
    name,
    phoneE164,
    email,
    ...extra,
  }
}

export const CONTACT_BALANCES = [
  balance(CONTACT_C, 12000, {
    nextDueOn: '2026-10-25',
    nextDueCents: 12000,
    nextOpenDueOn: '2026-10-25',
  }),
  balance(CONTACT_D, 52000, {
    overdueCents: 20000,
    nextDueOn: '2026-11-10',
    nextDueCents: 16000,
    dueNotChargedCents: 20000,
    nextOpenDueOn: '2026-10-10',
  }),
  balance(CONTACT_E, 20000, {
    nextDueOn: '2026-11-10',
    nextDueCents: 20000,
    nextOpenDueOn: '2026-11-10',
  }),
  balance(CONTACT_F, -3000),
]

export function contactsAnswers(overrides: Record<string, FakeAnswer> = {}) {
  return {
    [`GET ${BASE}/contacts`]: () => Response.json(CONTACTS),
    [`GET ${BASE}/contacts/balances`]: () => Response.json(CONTACT_BALANCES),
    ...overrides,
  }
}
