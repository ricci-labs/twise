import { withWorkspace } from '@api/core/db/tx'
import { createContact } from '@api/modules/contacts'
import {
  type DeliveryReport,
  deliverDueNotifications,
  enqueueNotification,
  type NewNotification,
} from '@api/modules/notifications'
import { notificationOutbox } from '@api/modules/notifications/notifications.table'
import { TEST_PUBLIC_URL } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { createCapturingLogger } from '@api/testing/logger'
import { createRecordingMailer } from '@api/testing/mailer'
import { captureMetrics } from '@api/testing/metrics'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const NOW = new Date('2026-10-17T12:00:00Z')
const captured = captureMetrics()

let userId: string

beforeAll(async () => {
  userId = await fixtures.createUser('reminded')
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

function billReminder(
  workspaceId: string,
  overrides: Partial<NewNotification> = {},
): NewNotification {
  return {
    workspaceId,
    recipient: { userId },
    channel: 'email',
    kind: 'bill_reminder',
    payload: {
      description: 'Aluguel',
      amountCents: 200_000,
      isEstimate: false,
      dueOn: '2026-10-20',
    },
    dueAt: new Date('2026-10-17T11:00:00Z'),
    dedupeKey: crypto.randomUUID(),
    ...overrides,
  }
}

async function queue(workspaceId: string, notification: NewNotification) {
  await withWorkspace(databases.app, workspaceId, (tx) => enqueueNotification(tx, notification))
}

function deps(mailer = createRecordingMailer().mailer, now = NOW) {
  return {
    mailer,
    publicUrl: TEST_PUBLIC_URL,
    clock: { now: () => now },
    logger: createCapturingLogger().logger,
  }
}

async function rowsOf(workspaceId: string) {
  return databases.owner
    .select()
    .from(notificationOutbox)
    .where(eq(notificationOutbox.workspaceId, workspaceId))
}

describe('deliverDueNotifications', () => {
  it('emails what is due in pt-BR and marks it sent', async () => {
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Deliver')
    const recording = createRecordingMailer()
    await queue(workspaceId, billReminder(workspaceId))

    expect(
      await deliverDueNotifications(databases.app, workspaceId, deps(recording.mailer)),
    ).toEqual({
      sent: 1,
      retried: 0,
      failed: 0,
    })
    expect(recording.sent[0]).toMatchObject({
      template: 'bill_reminder',
      subject: 'Aluguel vence em 20/10/2026',
    })
    expect(recording.sent[0]?.text).toContain('no valor de R$ 2.000,00')
    expect((await rowsOf(workspaceId))[0]).toMatchObject({ status: 'sent', sentAt: NOW })
    expect(await captured.scrape()).toContain(
      'financas_notifications_total{channel="email",kind="bill_reminder",outcome="sent"} 1',
    )
  })

  it('leaves what is not due yet, and WhatsApp messages until that channel exists', async () => {
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Not yet')
    await queue(workspaceId, billReminder(workspaceId, { dueAt: new Date('2026-10-18T12:00:00Z') }))
    await queue(workspaceId, billReminder(workspaceId, { channel: 'whatsapp' }))
    expect(await deliverDueNotifications(databases.app, workspaceId, deps())).toEqual({
      sent: 0,
      retried: 0,
      failed: 0,
    })
  })

  it('retries a failed send later, then gives up after five attempts', async () => {
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Retry')
    const broken = { send: async () => Promise.reject(new Error('SMTP down')) }
    await queue(workspaceId, billReminder(workspaceId))

    expect(await deliverDueNotifications(databases.app, workspaceId, deps(broken))).toMatchObject({
      retried: 1,
    })
    const [afterFirst] = await rowsOf(workspaceId)
    expect(afterFirst).toMatchObject({ status: 'pending', attempts: 1, lastError: 'SMTP down' })
    expect(afterFirst?.scheduledFor.toISOString()).toBe('2026-10-17T12:02:00.000Z')

    let later = NOW
    for (let attempt = 2; attempt <= 5; attempt += 1) {
      later = new Date(later.getTime() + 60 * 60_000)
      await deliverDueNotifications(databases.app, workspaceId, deps(broken, later))
    }
    expect((await rowsOf(workspaceId))[0]).toMatchObject({ status: 'failed', attempts: 5 })
  })

  it('gives up at once on a payload it cannot write or a contact without email', async () => {
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Give up')
    const { contactId } = await createContact(
      databases.app,
      { workspaceId, userId },
      { name: 'Contact J' },
    )
    await queue(workspaceId, billReminder(workspaceId, { payload: { wrong: true } }))
    await queue(workspaceId, billReminder(workspaceId, { recipient: { contactId } }))
    expect(await deliverDueNotifications(databases.app, workspaceId, deps())).toEqual({
      sent: 0,
      retried: 0,
      failed: 2,
    })
  })

  it('sends an e-mail prepared for a contact and tells the listener it left', async () => {
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Prepared')
    const contactId = await contactIn(workspaceId)
    const recording = createRecordingMailer()
    const reports: DeliveryReport[] = []
    await queue(workspaceId, preparedFor(workspaceId, contactId))

    const result = await deliverDueNotifications(databases.app, workspaceId, {
      ...deps(recording.mailer),
      onDelivered: async (_tx, report) => {
        reports.push(report)
      },
    })

    expect(result).toEqual({ sent: 1, retried: 0, failed: 0 })
    expect(recording.sent[0]).toMatchObject({
      template: 'charge',
      to: 'contact.j@example.test',
      fromName: 'Twise · Casa',
      replyTo: 'member.a@example.test',
    })
    expect(reports).toEqual([
      expect.objectContaining({ kind: 'charge', outcome: 'sent', error: null }),
    ])
  })

  it('gives up at once when the server refuses the address, and says why', async () => {
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Refused')
    const contactId = await contactIn(workspaceId)
    const refused = Object.assign(new Error('550 5.1.1 mailbox unavailable'), { responseCode: 550 })
    const reports: DeliveryReport[] = []
    await queue(workspaceId, preparedFor(workspaceId, contactId))

    const result = await deliverDueNotifications(databases.app, workspaceId, {
      ...deps({ send: async () => Promise.reject(refused) }),
      onDelivered: async (_tx, report) => {
        reports.push(report)
      },
    })

    expect(result).toEqual({ sent: 0, retried: 0, failed: 1 })
    expect((await rowsOf(workspaceId))[0]).toMatchObject({ status: 'failed', attempts: 1 })
    expect(reports).toEqual([
      expect.objectContaining({ outcome: 'failed', error: '550 5.1.1 mailbox unavailable' }),
    ])
  })

  it('retries a temporary failure without telling the listener yet', async () => {
    const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, 'Busy')
    const contactId = await contactIn(workspaceId)
    const busy = Object.assign(new Error('421 try again later'), { responseCode: 421 })
    const reports: DeliveryReport[] = []
    await queue(workspaceId, preparedFor(workspaceId, contactId))

    const result = await deliverDueNotifications(databases.app, workspaceId, {
      ...deps({ send: async () => Promise.reject(busy) }),
      onDelivered: async (_tx, report) => {
        reports.push(report)
      },
    })

    expect(result).toEqual({ sent: 0, retried: 1, failed: 0 })
    expect(reports).toEqual([])
  })
})

async function contactIn(workspaceId: string): Promise<string> {
  const { contactId } = await createContact(
    databases.app,
    { workspaceId, userId },
    { name: 'Contact J' },
  )
  return contactId
}

function preparedFor(workspaceId: string, contactId: string): NewNotification {
  return {
    workspaceId,
    recipient: { contactId },
    channel: 'email',
    kind: 'charge',
    payload: {
      email: {
        to: 'contact.j@example.test',
        subject: 'Member A te enviou uma cobrança de R$ 200,00',
        text: 'Oi, Contact J!',
        html: '<p>Oi, Contact J!</p>',
        fromName: 'Twise · Casa',
        replyTo: 'member.a@example.test',
      },
    },
    dueAt: new Date('2026-10-17T11:00:00Z'),
    dedupeKey: crypto.randomUUID(),
  }
}
