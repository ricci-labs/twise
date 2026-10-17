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
    optedOutVia: null,
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
    optedOutVia: 'member',
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

export const MONEY_ACCOUNT = '00000000-0000-4000-8000-0000000000a7'
export const CHARGE_SENT = '00000000-0000-4000-8000-0000000000c1'
export const CHARGE_PAID = '00000000-0000-4000-8000-0000000000c2'

const PIX_PAYLOAD =
  '00020126580014br.gov.bcb.pix0136a1b2c3d4-0000-4000-8000-0000000000005204000053039865406200.005802BR5908MEMBER A6009SAO PAULO6304E1F2'

export const CONTACT_D_CHARGES = [
  {
    id: CHARGE_SENT,
    contactId: CONTACT_D,
    amountCents: 20000,
    dueOn: '2026-10-10',
    status: 'sent',
    paidCents: 0,
    messageText: `Oi, Member D! Member A pediu para te lembrar do que está em aberto.\n• Mercado da semana — R$ 120,00\n• Jantar de aniversário — R$ 80,00\nTotal: R$ 200,00\nPix copia e cola:\n${PIX_PAYLOAD}`,
    pixPayload: PIX_PAYLOAD,
    sentAt: '2026-10-20T17:32:00.000Z',
    sentVia: 'email',
    sentTo: 'member.d@exemplo.com',
    emailStatus: 'sent',
    emailError: null,
    payments: [],
    createdAt: '2026-10-20T17:30:00.000Z',
    items: [
      {
        postingId: '00000000-0000-4000-8000-0000000000f1',
        description: 'Mercado da semana',
        installmentNo: null,
        installmentCount: 1,
        effectiveOn: '2026-10-10',
        amountCents: 12000,
      },
      {
        postingId: '00000000-0000-4000-8000-0000000000f2',
        description: 'Jantar de aniversário',
        installmentNo: null,
        installmentCount: 1,
        effectiveOn: '2026-10-10',
        amountCents: 8000,
      },
    ],
  },
  {
    id: CHARGE_PAID,
    contactId: CONTACT_D,
    amountCents: 16000,
    dueOn: '2026-09-10',
    status: 'paid',
    paidCents: 16000,
    messageText: 'Oi, Member D! Total: R$ 160,00',
    pixPayload: null,
    sentAt: '2026-09-12T12:00:00.000Z',
    sentVia: 'whatsapp',
    sentTo: '+5511999990004',
    emailStatus: null,
    emailError: null,
    payments: [
      {
        entryId: '00000000-0000-4000-8000-0000000000e9',
        amountCents: 16000,
        receivedOn: '2026-09-15',
        accountId: MONEY_ACCOUNT,
      },
    ],
    createdAt: '2026-09-12T12:00:00.000Z',
    items: [
      {
        postingId: '00000000-0000-4000-8000-0000000000f0',
        description: 'TV da sala',
        installmentNo: 1,
        installmentCount: 3,
        effectiveOn: '2026-09-10',
        amountCents: 16000,
      },
    ],
  },
]

export const CONTACT_D_CHARGE_FAILED = {
  ...CONTACT_D_CHARGES[0],
  status: 'draft',
  emailStatus: 'failed',
  emailError: '550 5.1.1 mailbox unavailable',
}

const RECEIVABLE = '00000000-0000-4000-8000-0000000000ab'

export const CONTACT_D_RECEIPTS = [
  {
    id: '00000000-0000-4000-8000-0000000000e9',
    entryType: 'settlement',
    occurredOn: '2026-09-15',
    description: 'Member D pagou',
    amountCents: 16000,
    postings: [
      { accountId: MONEY_ACCOUNT, amountCents: 16000 },
      { accountId: RECEIVABLE, amountCents: -16000 },
    ],
  },
  {
    id: '00000000-0000-4000-8000-0000000000ea',
    entryType: 'settlement',
    occurredOn: '2026-08-02',
    description: 'Member D pagou',
    amountCents: 9000,
    postings: [
      { accountId: MONEY_ACCOUNT, amountCents: 9000 },
      { accountId: RECEIVABLE, amountCents: -9000 },
    ],
  },
]

export function contactAnswers(contactId: string, overrides: Record<string, FakeAnswer> = {}) {
  return {
    ...contactsAnswers(),
    [`GET ${BASE}/contacts/${contactId}`]: () =>
      Response.json(CONTACTS.find((item) => item.id === contactId)),
    [`GET ${BASE}/contacts/${contactId}/open-items`]: () =>
      Response.json(contactId === CONTACT_D ? CONTACT_D_OPEN_ITEMS : []),
    [`GET ${BASE}/charges`]: () => Response.json(contactId === CONTACT_D ? CONTACT_D_CHARGES : []),
    [`GET ${BASE}/charges/${CHARGE_SENT}`]: () => Response.json(CONTACT_D_CHARGES[0]),
    [`GET ${BASE}/entries`]: () =>
      Response.json({ items: contactId === CONTACT_D ? CONTACT_D_RECEIPTS : [], nextCursor: null }),
    [`GET ${BASE}/accounts`]: () =>
      Response.json([
        {
          id: MONEY_ACCOUNT,
          parentId: null,
          kind: 'checking',
          name: 'Conta X',
          icon: null,
          color: null,
          ownerUserId: null,
          holderUserId: null,
          isShared: true,
          archivedAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    [`GET ${BASE}/settings/charge-text`]: () =>
      Response.json({
        subject: '{quem cobra} te enviou uma cobrança de {valor}',
        opening: '{quem cobra} pediu para te lembrar do que está em aberto.',
        closing: null,
        isDefault: true,
      }),
    ...overrides,
  }
}

export const UPCOMING_ITEMS = [
  {
    contactId: CONTACT_C,
    contactName: 'Member C',
    postingId: '00000000-0000-4000-8000-0000000000f1',
    description: 'Cinema e pipoca',
    installmentNo: null,
    installmentCount: 1,
    dueOn: '2026-10-25',
    remainingCents: 12000,
  },
  {
    contactId: CONTACT_D,
    contactName: 'Member D',
    postingId: '00000000-0000-4000-8000-0000000000f2',
    description: 'TV da sala',
    installmentNo: 2,
    installmentCount: 3,
    dueOn: '2026-11-10',
    remainingCents: 16000,
  },
]

export function contactsAnswers(overrides: Record<string, FakeAnswer> = {}) {
  return {
    [`GET ${BASE}/contacts`]: () => Response.json(CONTACTS),
    [`GET ${BASE}/contacts/balances`]: () => Response.json(CONTACT_BALANCES),
    [`GET ${BASE}/contacts/upcoming`]: () => Response.json(UPCOMING_ITEMS),
    ...overrides,
  }
}
