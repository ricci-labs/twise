import { createApp } from '@api/app'
import type { AllocationPartCandidates, AllocationPartList } from '@api/modules/planning'
import { testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { addMemberWithSystemRole, loggedInUser, requestsAs } from '@api/testing/http'
import type { SessionRequests } from '@api/testing/testing.types'
import { todayIn } from '@financas/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const app = createApp(testAppDeps({ db: databases.app }))
const PERIOD = '2026-10'

let member: SessionRequests
let viewer: SessionRequests
let workspacePath: string
let partsPath: string
let checkingId: string
let savingsId: string
let tripId: string

beforeAll(async () => {
  const ownerSession = await loggedInUser(app, databases.app, fixtures.runId, 'parts-owner')
  const memberSession = await loggedInUser(app, databases.app, fixtures.runId, 'parts-member')
  const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'parts-viewer')
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(ownerSession.userId, 'Parts')
  for (const [session, role] of [
    [memberSession, 'member'],
    [viewerSession, 'viewer'],
  ] as const) {
    await addMemberWithSystemRole(databases.app, databases.owner, workspaceId, session.userId, role)
  }
  const owner = requestsAs(app, ownerSession)
  member = requestsAs(app, memberSession)
  viewer = requestsAs(app, viewerSession)
  workspacePath = `/api/workspaces/${workspaceId}`
  partsPath = `${workspacePath}/allocation-parts`
  const account = async (kind: string, name: string) =>
    (
      (await (await owner.post(`${workspacePath}/accounts`, { kind, name })).json()) as {
        accountId: string
      }
    ).accountId
  checkingId = await account('checking', 'Conta X')
  savingsId = await account('savings', 'Poupança')
  tripId = await account('savings', 'Viagem')
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

function today(): string {
  return todayIn('America/Sao_Paulo', new Date())
}

async function transfer(toAccountId: string, amountCents: number): Promise<string> {
  const response = await member.post(
    `${workspacePath}/entries`,
    transferBody(toAccountId, amountCents),
  )
  return ((await response.json()) as { entryId: string }).entryId
}

function transferBody(toAccountId: string, amountCents: number) {
  return {
    entryType: 'transfer',
    occurredOn: today(),
    description: 'Divisão da comissão',
    amountCents,
    fromAccountId: checkingId,
    toAccountId,
  }
}

async function parts(): Promise<AllocationPartList['items']> {
  return ((await (await viewer.get(`${partsPath}?period=${PERIOD}`)).json()) as AllocationPartList)
    .items
}

async function codeOf(response: Response): Promise<string> {
  return ((await response.json()) as { error: { code: string } }).error.code
}

describe('allocation parts', () => {
  it('record a transfer as a done part, shared by everyone in the workspace', async () => {
    const entryId = await transfer(savingsId, 60_000)
    const recorded = await member.post(partsPath, {
      periodLabel: PERIOD,
      position: 1,
      toAccountId: savingsId,
      entryId,
    })
    expect(recorded.status).toBe(201)
    expect(await parts()).toEqual([{ position: 1, toAccountId: savingsId, entryId }])
  })

  it('refuse a part done twice, a transfer used twice, a wrong transfer and a viewer', async () => {
    const entryId = await transfer(tripId, 30_000)
    await member.post(partsPath, { periodLabel: PERIOD, position: 2, toAccountId: tripId, entryId })

    const again = await member.post(partsPath, {
      periodLabel: PERIOD,
      position: 2,
      toAccountId: tripId,
      entryId: await transfer(tripId, 1_000),
    })
    expect([again.status, await codeOf(again)]).toEqual([409, 'ALLOCATION_PART_TAKEN'])

    const reused = await member.post(partsPath, {
      periodLabel: PERIOD,
      position: 3,
      toAccountId: tripId,
      entryId,
    })
    expect([reused.status, await codeOf(reused)]).toEqual([409, 'ALLOCATION_ENTRY_TAKEN'])

    const elsewhere = await member.post(partsPath, {
      periodLabel: PERIOD,
      position: 4,
      toAccountId: savingsId,
      entryId: await transfer(tripId, 2_000),
    })
    expect([elsewhere.status, await codeOf(elsewhere)]).toEqual([400, 'ALLOCATION_ENTRY_INVALID'])

    const byViewer = await viewer.post(partsPath, {
      periodLabel: PERIOD,
      position: 5,
      toAccountId: tripId,
      entryId: await transfer(tripId, 3_000),
    })
    expect(byViewer.status).toBe(403)
  })

  it('follow the transfer when it is edited, and undo the part when it is deleted', async () => {
    const entryId = await transfer(savingsId, 10_000)
    await member.post(partsPath, {
      periodLabel: '2026-11',
      position: 1,
      toAccountId: savingsId,
      entryId,
    })
    const replaced = await member.put(
      `${workspacePath}/entries/${entryId}`,
      transferBody(savingsId, 12_000),
    )
    const { entryId: newEntryId } = (await replaced.json()) as { entryId: string }
    const novemberParts = async () =>
      ((await (await viewer.get(`${partsPath}?period=2026-11`)).json()) as AllocationPartList).items
    expect(await novemberParts()).toEqual([
      { position: 1, toAccountId: savingsId, entryId: newEntryId },
    ])

    await member.del(`${workspacePath}/entries/${newEntryId}`, {})
    expect(await novemberParts()).toEqual([])

    await member.post(`${workspacePath}/entries/${newEntryId}/restore`)
    expect(await novemberParts()).toEqual([])
  })

  it('list recent transfers into an account that no part uses yet', async () => {
    const free = await transfer(tripId, 4_500)
    const response = await member.get(`${partsPath}/candidates?toAccountId=${tripId}`)
    const { items } = (await response.json()) as AllocationPartCandidates
    const ids = items.map((item) => item.entryId)
    expect(ids).toContain(free)
    const used = (await parts()).map((part) => part.entryId)
    expect(ids.some((id) => used.includes(id))).toBe(false)
  })
})
