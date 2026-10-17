import { createApp } from '@api/app'
import {
  type ChargeView,
  cancelCharge,
  createCharge,
  createContact,
  listCharges,
  listContactBalances,
  listOpenItems,
  listUpcomingContactItems,
  markChargeSent,
  payCharge,
} from '@api/modules/contacts'
import { createAccount, createCard, deleteEntry, recordEntry } from '@api/modules/ledger'
import { setPixReceiving } from '@api/modules/workspaces'
import { testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { addMemberWithSystemRole, loggedInUser, requestsAs } from '@api/testing/http'
import { todayIn } from '@financas/shared'
import { afterAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const MID_OCTOBER = { now: () => new Date('2026-10-15T12:00:00Z') }
const UP_TO_TODAY = { includeCharged: false }
const EVERY_INSTALLMENT = { until: '9999-12-31', includeCharged: true }

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

async function household() {
  const userId = await fixtures.createUser(`charges-${crypto.randomUUID().slice(0, 8)}`)
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Charges')
  const context = { workspaceId, userId }
  const checking = (
    await createAccount(databases.app, context, { kind: 'checking', name: 'Conta X' })
  ).accountId
  const fun = (
    await createAccount(databases.app, context, { kind: 'expense_category', name: 'Lazer' })
  ).accountId
  const card = (
    await createCard(databases.app, context, { name: 'Card X', closingDay: 3, dueDay: 10 })
  ).accountId
  const { contactId } = await createContact(databases.app, context, { name: 'Contact J' })
  const entry = (input: Record<string, unknown>) =>
    recordEntry(databases.app, { ...context, source: 'web' }, input, MID_OCTOBER)
  await entry({
    entryType: 'card_purchase',
    occurredOn: '2026-10-05',
    description: 'TV',
    amountCents: 120_000,
    installmentCount: 3,
    cardAccountId: card,
    categoryId: fun,
    shares: [{ contactId, amountCents: 30_000 }],
  })
  await entry({
    entryType: 'expense',
    occurredOn: '2026-10-06',
    description: 'Jantar',
    amountCents: 15_000,
    paidFromAccountId: checking,
    categoryId: fun,
    shares: [{ contactId, amountCents: 5_000 }],
  })
  await entry({
    entryType: 'settlement',
    occurredOn: '2026-10-07',
    description: 'Pix',
    amountCents: 2_000,
    contactId,
    receivedInAccountId: checking,
  })
  const ref = { workspaceId, contactId }
  const charge = (until?: string) =>
    createCharge(databases.app, ref, userId, until ? { until } : {}, MID_OCTOBER)
  const charges = () => listCharges(databases.app, workspaceId, contactId)
  return { workspaceId, userId, contactId, checking, charge, charges }
}

function byId(charges: ChargeView[], chargeId: string): ChargeView | undefined {
  return charges.find((charge) => charge.id === chargeId)
}

describe('createCharge', () => {
  it('charges what is open up to today, the oldest paid first, with a pt-BR message', async () => {
    const { charge, charges } = await household()
    const { chargeId } = await charge()
    const created = byId(await charges(), chargeId)
    expect(created).toMatchObject({
      amountCents: 3_000,
      dueOn: '2026-10-06',
      status: 'draft',
      pixPayload: null,
    })
    expect(created?.items).toEqual([
      {
        postingId: expect.any(String),
        description: 'Jantar',
        installmentNo: null,
        installmentCount: 1,
        effectiveOn: '2026-10-06',
        amountCents: 3_000,
      },
    ])
    expect(created?.messageText).toContain('Oi, Contact J!')
    expect(created?.messageText).toContain('• Jantar — R$ 30,00')
  })

  it('leaves items already charged out of the next charge, and carries the Pix when set', async () => {
    const { workspaceId, charge, charges } = await household()
    await charge()
    await setPixReceiving(databases.app, workspaceId, {
      key: 'household@example.test',
      receiverName: 'Casa',
      receiverCity: 'Sao Paulo',
    })
    const { chargeId } = await charge('2026-11-30')
    const next = byId(await charges(), chargeId)
    expect(next).toMatchObject({ amountCents: 10_000, dueOn: '2026-11-10' })
    expect(next?.messageText).toContain('• TV (parcela 1/3) — R$ 100,00')
    expect(next?.items).toContainEqual(
      expect.objectContaining({
        description: 'TV',
        installmentNo: 1,
        installmentCount: 3,
        effectiveOn: '2026-11-10',
        amountCents: 10_000,
      }),
    )
    expect(next?.pixPayload).toContain('br.gov.bcb.pix')
    expect(next?.messageText).toContain(next?.pixPayload ?? 'missing')
  })

  it('charges an item again once its charge is cancelled, and refuses when nothing is open', async () => {
    const { workspaceId, charge, charges } = await household()
    const { chargeId } = await charge()
    await expect(charge()).rejects.toMatchObject({ code: 'NOTHING_TO_CHARGE' })
    await cancelCharge(databases.app, { workspaceId, chargeId })
    const again = await charge()
    expect(byId(await charges(), again.chargeId)?.amountCents).toBe(3_000)
  })
})

describe('listOpenItems', () => {
  it('shows what a charge would include, up to today or a chosen day', async () => {
    const { workspaceId, contactId, charge } = await household()
    const ref = { workspaceId, contactId }
    expect(await listOpenItems(databases.app, ref, UP_TO_TODAY, MID_OCTOBER)).toEqual([
      expect.objectContaining({
        description: 'Jantar',
        amountCents: 5_000,
        remainingCents: 3_000,
        inChargeId: null,
        inChargeCreatedOn: null,
      }),
    ])
    expect(
      (
        await listOpenItems(
          databases.app,
          ref,
          { until: '2026-11-30', includeCharged: false },
          MID_OCTOBER,
        )
      ).map((item) => item.description),
    ).toEqual(['Jantar', 'TV'])

    await charge()
    expect(await listOpenItems(databases.app, ref, UP_TO_TODAY, MID_OCTOBER)).toEqual([])
  })

  it('keeps the items already charged when asked, with every future installment', async () => {
    const { workspaceId, contactId, charge } = await household()
    const ref = { workspaceId, contactId }
    const { chargeId } = await charge()
    const items = await listOpenItems(databases.app, ref, EVERY_INSTALLMENT, MID_OCTOBER)
    expect(items.map((item) => [item.description, item.effectiveOn, item.inChargeId])).toEqual([
      ['Jantar', '2026-10-06', chargeId],
      ['TV', '2026-11-10', null],
      ['TV', '2026-12-10', null],
      ['TV', '2027-01-10', null],
    ])
    expect(items[0]?.inChargeCreatedOn).toBe(todayIn('America/Sao_Paulo', new Date()))
  })
})

describe('the charge state in the balances', () => {
  it('says what is due and not charged, the newest open charge and the next date', async () => {
    const { workspaceId, userId, checking, charge } = await household()
    const state = async () => {
      const [balance] = await listContactBalances(databases.app, workspaceId, MID_OCTOBER)
      return {
        dueNotChargedCents: balance?.dueNotChargedCents,
        nextOpenDueOn: balance?.nextOpenDueOn,
        lastCharge: balance?.lastCharge,
      }
    }
    expect(await state()).toEqual({
      dueNotChargedCents: 3_000,
      nextOpenDueOn: '2026-11-10',
      lastCharge: null,
    })

    const first = await charge()
    expect(await state()).toEqual({
      dueNotChargedCents: 0,
      nextOpenDueOn: '2026-11-10',
      lastCharge: {
        chargeId: first.chargeId,
        createdOn: todayIn('America/Sao_Paulo', new Date()),
        status: 'draft',
      },
    })

    const ahead = await charge('2026-11-30')
    expect(await state()).toMatchObject({
      nextOpenDueOn: '2026-12-10',
      lastCharge: { chargeId: ahead.chargeId },
    })

    await payCharge(
      databases.app,
      { workspaceId, chargeId: ahead.chargeId },
      userId,
      { amountCents: 10_000, receivedInAccountId: checking, occurredOn: '2026-10-15' },
      MID_OCTOBER,
    )
    expect((await state()).lastCharge).toMatchObject({ chargeId: first.chargeId })
    await cancelCharge(databases.app, { workspaceId, chargeId: first.chargeId })
    expect(await state()).toMatchObject({ lastCharge: null })
  })
})

describe('listUpcomingContactItems', () => {
  it('lists what falls due after today, soonest first, charged or not', async () => {
    const { workspaceId, charge } = await household()
    await charge('2026-11-30')
    const upcoming = await listUpcomingContactItems(databases.app, workspaceId, 2, MID_OCTOBER)
    expect(upcoming).toEqual([
      {
        contactId: expect.any(String),
        contactName: 'Contact J',
        postingId: expect.any(String),
        description: 'TV',
        installmentNo: 1,
        installmentCount: 3,
        dueOn: '2026-11-10',
        remainingCents: 10_000,
      },
      expect.objectContaining({ installmentNo: 2, dueOn: '2026-12-10' }),
    ])
  })
})

describe('charge status', () => {
  it('goes from draft to sent, and can be cancelled while open, not twice', async () => {
    const { workspaceId, charge, charges } = await household()
    const { chargeId } = await charge()
    const ref = { workspaceId, chargeId }
    await markChargeSent(databases.app, ref, MID_OCTOBER)
    expect(byId(await charges(), chargeId)).toMatchObject({ status: 'sent' })
    await expect(markChargeSent(databases.app, ref)).rejects.toMatchObject({
      code: 'CHARGE_STATUS_REFUSED',
    })
    await cancelCharge(databases.app, ref)
    await expect(cancelCharge(databases.app, ref)).rejects.toMatchObject({
      code: 'CHARGE_STATUS_REFUSED',
    })
  })
})

describe('payCharge', () => {
  it('records settlements against a charge, which becomes partially paid, then paid', async () => {
    const { workspaceId, userId, checking, charge, charges } = await household()
    const { chargeId } = await charge()
    const ref = { workspaceId, chargeId }
    const pay = (amountCents: number) =>
      payCharge(
        databases.app,
        ref,
        userId,
        { amountCents, receivedInAccountId: checking, occurredOn: '2026-10-16' },
        MID_OCTOBER,
      )

    await pay(1_000)
    expect(byId(await charges(), chargeId)).toMatchObject({
      status: 'partially_paid',
      paidCents: 1_000,
    })
    await expect(cancelCharge(databases.app, ref)).rejects.toMatchObject({
      code: 'CHARGE_STATUS_REFUSED',
    })
    const { entryId } = await pay(2_000)
    expect(byId(await charges(), chargeId)).toMatchObject({ status: 'paid', paidCents: 3_000 })

    await deleteEntry(databases.app, { workspaceId, entryId, userId })
    expect(byId(await charges(), chargeId)).toMatchObject({
      status: 'partially_paid',
      paidCents: 1_000,
    })
  })

  it('refuses paying a cancelled charge', async () => {
    const { workspaceId, userId, checking, charge } = await household()
    const { chargeId } = await charge()
    await cancelCharge(databases.app, { workspaceId, chargeId })
    await expect(
      payCharge(
        databases.app,
        { workspaceId, chargeId },
        userId,
        { amountCents: 1_000, receivedInAccountId: checking, occurredOn: '2026-10-16' },
        MID_OCTOBER,
      ),
    ).rejects.toMatchObject({ code: 'CHARGE_STATUS_REFUSED' })
  })
})

describe('charges over HTTP', () => {
  it('let contacts:create charge and contacts:update send or cancel; viewers only read', async () => {
    const app = createApp(testAppDeps({ db: databases.app }))
    const ownerSession = await loggedInUser(app, databases.app, fixtures.runId, 'charges-owner')
    const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'charges-viewer')
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(
      ownerSession.userId,
      'Charges HTTP',
    )
    await addMemberWithSystemRole(
      databases.app,
      databases.owner,
      workspaceId,
      viewerSession.userId,
      'viewer',
    )
    const owner = requestsAs(app, ownerSession)
    const viewer = requestsAs(app, viewerSession)
    const base = `/api/workspaces/${workspaceId}`
    const contact = await owner.post(`${base}/contacts`, { name: 'Contact Z' })
    const { contactId } = (await contact.json()) as { contactId: string }

    expect((await viewer.post(`${base}/contacts/${contactId}/charges`, {})).status).toBe(403)
    const empty = await owner.post(`${base}/contacts/${contactId}/charges`, {})
    expect(empty.status).toBe(409)
    expect((await viewer.get(`${base}/charges?contactId=${contactId}`)).status).toBe(200)
    expect((await owner.post(`${base}/charges/not-a-uuid/cancel`)).status).toBe(404)
    expect((await viewer.post(`${base}/charges/${crypto.randomUUID()}/sent`)).status).toBe(403)
  })
})

describe('GET /charges/:chargeId', () => {
  it('shows one charge as the list does, only inside its workspace', async () => {
    const app = createApp(testAppDeps({ db: databases.app }))
    const { workspaceId, charge, charges } = await household()
    const { chargeId } = await charge()
    const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'charge-reader')
    await addMemberWithSystemRole(
      databases.app,
      databases.owner,
      workspaceId,
      viewerSession.userId,
      'viewer',
    )
    const viewer = requestsAs(app, viewerSession)
    const listed = byId(await charges(), chargeId)

    const response = await viewer.get(`/api/workspaces/${workspaceId}/charges/${chargeId}`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(JSON.parse(JSON.stringify(listed)))

    const other = await household()
    const { chargeId: foreignChargeId } = await other.charge()
    for (const id of [foreignChargeId, crypto.randomUUID(), 'not-a-uuid']) {
      const missing = await viewer.get(`/api/workspaces/${workspaceId}/charges/${id}`)
      expect(missing.status).toBe(404)
      expect(await missing.json()).toMatchObject({ error: { code: 'CHARGE_NOT_FOUND' } })
    }
  })
})

describe('GET /contacts/:contactId/open-items', () => {
  it('answers what a charge would include, and refuses a bad day or an unknown contact', async () => {
    const app = createApp(testAppDeps({ db: databases.app }))
    const { workspaceId, contactId } = await household()
    const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'open-items')
    await addMemberWithSystemRole(
      databases.app,
      databases.owner,
      workspaceId,
      viewerSession.userId,
      'viewer',
    )
    const viewer = requestsAs(app, viewerSession)
    const contactPath = `/api/workspaces/${workspaceId}/contacts`

    const response = await viewer.get(`${contactPath}/${contactId}/open-items?until=2026-11-30`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(
      await listOpenItems(
        databases.app,
        { workspaceId, contactId },
        { until: '2026-11-30', includeCharged: false },
      ),
    )
    const everything = await viewer.get(
      `${contactPath}/${contactId}/open-items?until=9999-12-31&includeCharged=true`,
    )
    expect(await everything.json()).toEqual(
      await listOpenItems(databases.app, { workspaceId, contactId }, EVERY_INSTALLMENT),
    )
    const badFlag = await viewer.get(`${contactPath}/${contactId}/open-items?includeCharged=maybe`)
    expect(badFlag.status).toBe(400)

    const badDay = await viewer.get(`${contactPath}/${contactId}/open-items?until=30/11/2026`)
    expect(badDay.status).toBe(400)
    expect(await badDay.json()).toMatchObject({ error: { code: 'OPEN_ITEMS_QUERY_INVALID' } })
    const unknown = await viewer.get(`${contactPath}/${crypto.randomUUID()}/open-items`)
    expect(unknown.status).toBe(404)
    expect(await unknown.json()).toMatchObject({ error: { code: 'CONTACT_NOT_FOUND' } })
  })
})

describe('GET /contacts/upcoming', () => {
  it('lets a viewer see the next due items, and refuses a bad limit', async () => {
    const app = createApp(testAppDeps({ db: databases.app }))
    const { workspaceId } = await household()
    const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'upcoming')
    await addMemberWithSystemRole(
      databases.app,
      databases.owner,
      workspaceId,
      viewerSession.userId,
      'viewer',
    )
    const viewer = requestsAs(app, viewerSession)
    const upcomingPath = `/api/workspaces/${workspaceId}/contacts/upcoming`

    const response = await viewer.get(`${upcomingPath}?limit=1`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(
      await listUpcomingContactItems(databases.app, workspaceId, 1),
    )
    const badLimit = await viewer.get(`${upcomingPath}?limit=0`)
    expect(badLimit.status).toBe(400)
    expect(await badLimit.json()).toMatchObject({
      error: { code: 'UPCOMING_CONTACT_ITEMS_QUERY_INVALID' },
    })
  })
})
