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
  contact(CONTACT_D, 'Member D', {
    phoneE164: '+5511999990004',
    email: 'member.d@exemplo.com',
    pixKey: 'member.d@exemplo.com',
    notes: 'Divide a TV da sala e o mercado do mês.',
  }),
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
    overdueSince: null,
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
    overdueSince: '2026-10-10',
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

function openItem(postingId: string, description: string, effectiveOn: string, extra: object = {}) {
  return {
    postingId,
    description,
    installmentNo: null,
    installmentCount: 1,
    effectiveOn,
    amountCents: 12000,
    remainingCents: 12000,
    inChargeId: null,
    inChargeCreatedOn: null,
    ...extra,
  }
}

export const CONTACT_D_OPEN_ITEMS = [
  openItem('00000000-0000-4000-8000-0000000000f1', 'Mercado da semana', '2026-10-10'),
  openItem('00000000-0000-4000-8000-0000000000f2', 'Jantar de aniversário', '2026-10-10', {
    amountCents: 8000,
    remainingCents: 8000,
  }),
  openItem('00000000-0000-4000-8000-0000000000f3', 'TV da sala', '2026-11-10', {
    installmentNo: 2,
    installmentCount: 3,
    amountCents: 16000,
    remainingCents: 16000,
  }),
  openItem('00000000-0000-4000-8000-0000000000f4', 'TV da sala', '2026-12-10', {
    installmentNo: 3,
    installmentCount: 3,
    amountCents: 16000,
    remainingCents: 16000,
  }),
]

export function contactAnswers(contactId: string, overrides: Record<string, FakeAnswer> = {}) {
  return {
    ...contactsAnswers(),
    [`GET ${BASE}/contacts/${contactId}`]: () =>
      Response.json(CONTACTS.find((item) => item.id === contactId)),
    [`GET ${BASE}/contacts/${contactId}/open-items`]: () =>
      Response.json(contactId === CONTACT_D ? CONTACT_D_OPEN_ITEMS : []),
    ...overrides,
  }
}

export function contactsAnswers(overrides: Record<string, FakeAnswer> = {}) {
  return {
    [`GET ${BASE}/contacts`]: () => Response.json(CONTACTS),
    [`GET ${BASE}/contacts/balances`]: () => Response.json(CONTACT_BALANCES),
    ...overrides,
  }
}
