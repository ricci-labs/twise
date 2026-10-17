import { createApp } from '@api/app'
import { withWorkspace } from '@api/core/db/tx'
import { hashToken } from '@api/core/security/tokens'
import type { ContactItem } from '@api/modules/contacts'
import { contactOptOutTokens, contacts } from '@api/modules/contacts/contacts.table'
import { issueOptOutToken } from '@api/modules/contacts/use-cases/opt-out'
import { createAccountEmailLimits } from '@api/modules/identity'
import { TEST_PUBLIC_URL, testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { loggedInUser, requestsAs } from '@api/testing/http'
import type { SessionRequests, TestApp } from '@api/testing/testing.types'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const app = createApp(testAppDeps({ db: databases.app }))
const OPT_OUT_PATH = '/api/public/contacts/opt-out'

let member: SessionRequests
let workspaceId: string
let contactsPath: string

beforeAll(async () => {
  const session = await loggedInUser(app, databases.app, fixtures.runId, 'opt-out-member')
  workspaceId = (await fixtures.createWorkspaceOwnedBy(session.userId, 'Opt-out')).workspaceId
  member = requestsAs(app, session)
  contactsPath = `/api/workspaces/${workspaceId}/contacts`
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

async function optOut(target: TestApp, token: unknown): Promise<Response> {
  return target.request(OPT_OUT_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: TEST_PUBLIC_URL },
    body: JSON.stringify({ token }),
  })
}

async function newContact(name: string): Promise<string> {
  const response = await member.post(contactsPath, { name, email: `${name}@example.test` })
  return ((await response.json()) as { contactId: string }).contactId
}

async function contactOf(contactId: string): Promise<ContactItem> {
  return (await (await member.get(`${contactsPath}/${contactId}`)).json()) as ContactItem
}

function optedOutAtOf(contactId: string): Promise<Date | null> {
  return withWorkspace(databases.app, workspaceId, async (tx) => {
    const [row] = await tx.select().from(contacts).where(eq(contacts.id, contactId))
    return row?.optedOutAt ?? null
  })
}

function linkTokenFor(contactId: string): Promise<string> {
  return withWorkspace(databases.app, workspaceId, async (tx) => {
    const [contact] = await tx.select().from(contacts).where(eq(contacts.id, contactId))
    if (!contact) {
      throw new Error('No such contact')
    }
    return issueOptOutToken(tx, contact)
  })
}

async function codeOf(response: Response): Promise<string> {
  return ((await response.json()) as { error: { code: string } }).error.code
}

describe('opting out by a member', () => {
  it('records that a member set it, and lets a member clear it', async () => {
    const contactId = await newContact('member-opt-out')
    const path = `${contactsPath}/${contactId}`
    expect((await member.patch(path, { isOptedOut: true })).status).toBe(204)
    expect(await contactOf(contactId)).toMatchObject({ isOptedOut: true, optedOutVia: 'member' })
    expect((await member.patch(path, { isOptedOut: false })).status).toBe(204)
    expect(await contactOf(contactId)).toMatchObject({ isOptedOut: false, optedOutVia: null })
  })
})

describe('POST /api/public/contacts/opt-out', () => {
  it('opts the contact out without login, keeping the first moment, for good', async () => {
    const contactId = await newContact('link-opt-out')
    const path = `${contactsPath}/${contactId}`
    await member.patch(path, { isOptedOut: true })
    const firstMoment = await optedOutAtOf(contactId)

    const done = await optOut(app, await linkTokenFor(contactId))
    expect([done.status, await done.json()]).toEqual([200, { requesterName: null }])
    expect(await contactOf(contactId)).toMatchObject({
      isOptedOut: true,
      optedOutVia: 'email_link',
    })
    expect(await optedOutAtOf(contactId)).toEqual(firstMoment)

    const undo = await member.patch(path, { isOptedOut: false })
    expect([undo.status, await codeOf(undo)]).toEqual([409, 'CONTACT_OPTED_OUT_BY_LINK'])
    expect((await member.patch(path, { isOptedOut: true })).status).toBe(204)
    expect((await contactOf(contactId)).optedOutVia).toBe('email_link')
  })

  it('keeps the link of every e-mail working, and stores only the hash of each', async () => {
    const contactId = await newContact('many-links')
    const older = await linkTokenFor(contactId)
    const newer = await linkTokenFor(contactId)
    const stored = await withWorkspace(databases.app, workspaceId, (tx) =>
      tx
        .select({ tokenHash: contactOptOutTokens.tokenHash })
        .from(contactOptOutTokens)
        .where(eq(contactOptOutTokens.contactId, contactId)),
    )
    expect(stored.map((row) => row.tokenHash).sort()).toEqual(
      [hashToken(older), hashToken(newer)].sort(),
    )

    expect((await optOut(app, older)).status).toBe(200)
    expect((await optOut(app, newer)).status).toBe(200)
    expect(await contactOf(contactId)).toMatchObject({ isOptedOut: true })
  })

  it('names who sent the last charge e-mail, so the page can say whom', async () => {
    const contactId = await newContact('charged-by-email')
    const workspacePath = `/api/workspaces/${workspaceId}`
    const accountId = async (body: object) =>
      (
        (await (await member.post(`${workspacePath}/accounts`, body)).json()) as {
          accountId: string
        }
      ).accountId
    await member.post(`${workspacePath}/entries`, {
      entryType: 'expense',
      occurredOn: '2026-10-01',
      description: 'Jantar',
      amountCents: 6_000,
      paidFromAccountId: await accountId({ kind: 'checking', name: 'Conta X' }),
      categoryId: await accountId({ kind: 'expense_category', name: 'Lazer' }),
      shares: [{ contactId, amountCents: 3_000 }],
    })
    const charge = (await (
      await member.post(`${contactsPath}/${contactId}/charges`, { until: '2026-10-31' })
    ).json()) as { chargeId: string }
    expect(
      (await member.post(`${workspacePath}/charges/${charge.chargeId}/send-email`)).status,
    ).toBe(204)

    const done = await optOut(app, await linkTokenFor(contactId))
    expect(await done.json()).toEqual({ requesterName: 'Member opt-out-member' })
  })

  it('answers LINK_INVALID to an unknown or malformed link, without touching anyone', async () => {
    const contactId = await newContact('untouched')
    const token = await linkTokenFor(contactId)
    for (const wrong of [`${token}x`, hashToken(token), '', 'x'.repeat(129), 42]) {
      const response = await optOut(app, wrong)
      expect([response.status, await codeOf(response)]).toEqual([400, 'LINK_INVALID'])
    }
    expect(await contactOf(contactId)).toMatchObject({ isOptedOut: false, optedOutVia: null })
  })

  it('stops a client that keeps trying unknown links', async () => {
    const limited = createApp(
      testAppDeps({
        db: databases.app,
        accountEmailLimits: createAccountEmailLimits({
          maxPerEmailPerHour: 3,
          maxPerClientPerHour: 10,
          maxInvalidLinksPerClientPerHour: 2,
        }),
      }),
    )
    const token = await linkTokenFor(await newContact('limited'))
    expect((await optOut(limited, 'unknown-1')).status).toBe(400)
    expect((await optOut(limited, 'unknown-2')).status).toBe(400)
    const blocked = await optOut(limited, token)
    expect([blocked.status, await codeOf(blocked)]).toEqual([429, 'TOO_MANY_ATTEMPTS'])
  })
})
