import { createApp } from '@api/app'
import {
  changeContact,
  createCharge,
  createContact,
  listCharges,
  recordChargeEmailOutcome,
} from '@api/modules/contacts'
import { createAccount, recordEntry } from '@api/modules/ledger'
import { deliverDueNotifications } from '@api/modules/notifications'
import { notificationOutbox } from '@api/modules/notifications/notifications.table'
import { setPixReceiving } from '@api/modules/workspaces'
import { TEST_PUBLIC_URL, testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { loggedInUser, requestsAs } from '@api/testing/http'
import { createCapturingLogger } from '@api/testing/logger'
import { createRecordingMailer } from '@api/testing/mailer'
import { preparedEmailPayloadSchema } from '@financas/shared'
import { eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const MID_OCTOBER = { now: () => new Date('2026-10-15T12:00:00Z') }
const CONTACT_EMAIL = 'contact.j@example.test'

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

async function household({ email = CONTACT_EMAIL as string | null, pix = true } = {}) {
  const app = createApp(testAppDeps({ db: databases.app }))
  const user = await loggedInUser(app, databases.app, fixtures.runId, 'charge-email')
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(user.userId, 'Casa')
  const context = { workspaceId, userId: user.userId }
  const checking = (
    await createAccount(databases.app, context, { kind: 'checking', name: 'Conta X' })
  ).accountId
  const fun = (
    await createAccount(databases.app, context, { kind: 'expense_category', name: 'Lazer' })
  ).accountId
  const { contactId } = await createContact(databases.app, context, {
    name: 'Contact J',
    email,
  })
  await recordEntry(
    databases.app,
    { ...context, source: 'web' },
    {
      entryType: 'expense',
      occurredOn: '2026-10-06',
      description: 'Jantar',
      amountCents: 15_000,
      paidFromAccountId: checking,
      categoryId: fun,
      shares: [{ contactId, amountCents: 5_000 }],
    },
    MID_OCTOBER,
  )
  if (pix) {
    await setPixReceiving(databases.app, workspaceId, {
      key: 'household@example.test',
      receiverName: 'Casa',
      receiverCity: 'Sao Paulo',
    })
  }
  const { chargeId } = await createCharge(
    databases.app,
    { workspaceId, contactId },
    user.userId,
    {},
    MID_OCTOBER,
  )
  const http = requestsAs(app, user)
  const sendEmail = () => http.post(`/api/workspaces/${workspaceId}/charges/${chargeId}/send-email`)
  const charge = async () =>
    (await listCharges(databases.app, workspaceId, contactId)).find(({ id }) => id === chargeId)
  const outbox = () =>
    databases.owner
      .select()
      .from(notificationOutbox)
      .where(eq(notificationOutbox.workspaceId, workspaceId))
  return { ...user, workspaceId, contactId, chargeId, sendEmail, charge, outbox }
}

async function codeOf(response: Response): Promise<string> {
  const body = (await response.json()) as { error: { code: string } }
  return body.error.code
}

function deliveryDeps(mailer = createRecordingMailer().mailer) {
  return {
    mailer,
    publicUrl: TEST_PUBLIC_URL,
    clock: { now: () => new Date(Date.now() + 60_000) },
    logger: createCapturingLogger().logger,
    onDelivered: recordChargeEmailOutcome,
  }
}

describe('POST /charges/:chargeId/send-email', () => {
  it('queues the charge e-mail for the contact and marks the charge sent by e-mail', async () => {
    const { sendEmail, charge, outbox, email: memberEmail } = await household()

    expect((await sendEmail()).status).toBe(204)

    expect(await charge()).toMatchObject({
      status: 'sent',
      sentVia: 'email',
      sentTo: CONTACT_EMAIL,
      emailStatus: 'queued',
      emailError: null,
    })
    const [queued] = await outbox()
    expect(queued).toMatchObject({ kind: 'charge', channel: 'email', status: 'pending' })
    const { email } = preparedEmailPayloadSchema.parse(queued?.payload)
    expect(email).toMatchObject({
      to: CONTACT_EMAIL,
      fromName: expect.stringMatching(/^Twise · Casa/),
      replyTo: memberEmail,
    })
    expect(email.subject).toMatch(/te enviou uma cobrança de R\$\s50,00$/)
    expect(email.text).toContain('Oi, Contact J!')
    expect(email.text).toMatch(/Jantar \(venceu 06\/10\): R\$\s50,00/)
    expect(email.text).toContain('Qualquer dúvida, é só responder este e-mail.')
    expect(email.text).toMatch(/Não quero mais receber cobranças por e-mail: .+\/opt-out#token=/)
    expect(email.html).toContain('src="cid:pix-qr"')
    expect(email.inlineImages?.[0]).toMatchObject({ cid: 'pix-qr', contentType: 'image/gif' })
  })

  it('leaves the Pix block out when the workspace has no Pix', async () => {
    const { sendEmail, outbox } = await household({ pix: false })
    await sendEmail()
    const { email } = preparedEmailPayloadSchema.parse((await outbox())[0]?.payload)
    expect(email.html).not.toContain('cid:pix-qr')
    expect(email.inlineImages).toEqual([])
    expect(email.text).not.toContain('Quem recebe')
  })

  it('refuses a contact without e-mail, or one who opted out', async () => {
    const withoutEmail = await household({ email: null })
    const refused = await withoutEmail.sendEmail()
    expect([refused.status, await codeOf(refused)]).toEqual([409, 'CONTACT_HAS_NO_EMAIL'])

    const optedOut = await household()
    await changeContact(
      databases.app,
      { workspaceId: optedOut.workspaceId, contactId: optedOut.contactId },
      { isOptedOut: true },
    )
    const blocked = await optedOut.sendEmail()
    expect([blocked.status, await codeOf(blocked)]).toEqual([409, 'CONTACT_OPTED_OUT'])
    expect(await optedOut.outbox()).toEqual([])
  })

  it('records that the e-mail left once the worker sends it', async () => {
    const { workspaceId, sendEmail, charge } = await household()
    await sendEmail()

    await deliverDueNotifications(databases.app, workspaceId, deliveryDeps())

    expect(await charge()).toMatchObject({ status: 'sent', emailStatus: 'sent' })
  })

  it('puts the charge back to draft with the reason when the address is refused', async () => {
    const { workspaceId, sendEmail, charge } = await household()
    await sendEmail()
    const refused = Object.assign(new Error('550 5.1.1 mailbox unavailable'), {
      responseCode: 550,
    })

    await deliverDueNotifications(
      databases.app,
      workspaceId,
      deliveryDeps({ send: async () => Promise.reject(refused) }),
    )

    expect(await charge()).toMatchObject({
      status: 'draft',
      sentVia: 'email',
      emailStatus: 'failed',
      emailError: '550 5.1.1 mailbox unavailable',
    })
  })
})
