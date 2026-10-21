import { createApp } from '@api/app'
import type { GoalItem } from '@api/modules/planning'
import { testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { addMemberWithSystemRole, loggedInUser, requestsAs } from '@api/testing/http'
import type { SessionRequests } from '@api/testing/testing.types'
import { monthsUntil } from '@financas/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const app = createApp(testAppDeps({ db: databases.app }))

let owner: SessionRequests
let member: SessionRequests
let viewer: SessionRequests
let workspacePath: string
let goalsPath: string

beforeAll(async () => {
  const ownerSession = await loggedInUser(app, databases.app, fixtures.runId, 'goals-owner')
  const memberSession = await loggedInUser(app, databases.app, fixtures.runId, 'goals-member')
  const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'goals-viewer')
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(ownerSession.userId, 'Goals')
  for (const [session, role] of [
    [memberSession, 'member'],
    [viewerSession, 'viewer'],
  ] as const) {
    await addMemberWithSystemRole(databases.app, databases.owner, workspaceId, session.userId, role)
  }
  owner = requestsAs(app, ownerSession)
  member = requestsAs(app, memberSession)
  viewer = requestsAs(app, viewerSession)
  workspacePath = `/api/workspaces/${workspaceId}`
  goalsPath = `${workspacePath}/goals`
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

async function created(response: Promise<Response>): Promise<string> {
  const body = (await (await response).json()) as { accountId?: string; goalId?: string }
  const id = body.accountId ?? body.goalId
  if (!id) {
    throw new Error(`Nothing was created: ${JSON.stringify(body)}`)
  }
  return id
}

async function codeOf(response: Response): Promise<string> {
  return ((await response.json()) as { error: { code: string } }).error.code
}

async function account(kind: string, name: string): Promise<string> {
  return created(owner.post(`${workspacePath}/accounts`, { kind, name }))
}

function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

async function goals(): Promise<GoalItem[]> {
  return (await (await viewer.get(goalsPath)).json()) as GoalItem[]
}

describe('goals', () => {
  it('track the balance of the account that holds them, the reserve first', async () => {
    const checking = await account('checking', 'Conta X')
    const reserve = await account('savings', 'Reserva')
    const trip = await account('savings', 'Viagem')
    const reserveId = await created(
      member.post(goalsPath, {
        name: 'Reserva',
        targetCents: 3_000_000,
        accountId: reserve,
        isReserve: true,
      }),
    )
    await created(
      member.post(goalsPath, {
        name: 'Carro novo',
        targetCents: 800_000,
        targetOn: '2027-07-01',
        accountId: trip,
      }),
    )
    await owner.post(`${workspacePath}/entries`, {
      entryType: 'transfer',
      occurredOn: '2026-10-05',
      description: 'Guardar comissão',
      amountCents: 100_000,
      fromAccountId: checking,
      toAccountId: reserve,
    })

    expect(await goals()).toEqual([
      {
        id: reserveId,
        name: 'Reserva',
        targetCents: 3_000_000,
        targetOn: null,
        accountId: reserve,
        isReserve: true,
        savedCents: 100_000,
        percent: 3,
        remainingCents: 2_900_000,
        overCents: 0,
        monthlyToTargetCents: null,
      },
      expect.objectContaining({ name: 'Carro novo', targetOn: '2027-07-01', savedCents: 0 }),
    ])
  })

  it('refuse a viewer, an account that holds no money, a shared account and a second reserve', async () => {
    const savings = await account('savings', 'Poupança')
    const category = await account('expense_category', 'Lazer')
    expect(
      (await viewer.post(goalsPath, { name: 'X', targetCents: 1, accountId: savings })).status,
    ).toBe(403)

    const onCategory = await member.post(goalsPath, {
      name: 'X',
      targetCents: 1,
      accountId: category,
    })
    expect([onCategory.status, await codeOf(onCategory)]).toEqual([400, 'GOAL_ACCOUNT_INVALID'])
    const onBenefit = await member.post(goalsPath, {
      name: 'X',
      targetCents: 1,
      accountId: await account('benefit', 'VR'),
    })
    expect([onBenefit.status, await codeOf(onBenefit)]).toEqual([400, 'GOAL_ACCOUNT_INVALID'])

    await created(member.post(goalsPath, { name: 'Carro', targetCents: 1, accountId: savings }))
    const shared = await member.post(goalsPath, {
      name: 'Moto',
      targetCents: 1,
      accountId: savings,
    })
    expect([shared.status, await codeOf(shared)]).toEqual([409, 'GOAL_ACCOUNT_TAKEN'])

    const other = await account('savings', 'Outra')
    const secondReserve = await member.post(goalsPath, {
      name: 'Outra reserva',
      targetCents: 1,
      accountId: other,
      isReserve: true,
    })
    expect([secondReserve.status, await codeOf(secondReserve)]).toEqual([
      409,
      'RESERVE_ALREADY_SET',
    ])
  })

  it('change only what is sent, and free the account once deleted', async () => {
    const house = await account('investment', 'Casa própria')
    const goalId = await created(
      member.post(goalsPath, {
        name: 'Casa',
        targetCents: 10_000_000,
        targetOn: '2030-01-01',
        accountId: house,
      }),
    )
    expect((await member.patch(`${goalsPath}/${goalId}`, { targetCents: 12_000_000 })).status).toBe(
      204,
    )
    expect((await goals()).find((goal) => goal.id === goalId)).toMatchObject({
      targetCents: 12_000_000,
      targetOn: '2030-01-01',
    })

    const toCategory = await member.patch(`${goalsPath}/${goalId}`, {
      accountId: await account('expense_category', 'Obras'),
    })
    expect([toCategory.status, await codeOf(toCategory)]).toEqual([400, 'GOAL_ACCOUNT_INVALID'])

    expect((await member.del(`${goalsPath}/${goalId}`)).status).toBe(403)
    expect((await owner.del(`${goalsPath}/${goalId}`)).status).toBe(204)
    expect((await goals()).map((goal) => goal.id)).not.toContain(goalId)
    expect(
      (await member.post(goalsPath, { name: 'Casa 2', targetCents: 1, accountId: house })).status,
    ).toBe(201)
    const gone = await owner.patch(`${goalsPath}/${goalId}`, { name: 'Nope' })
    expect([gone.status, await codeOf(gone)]).toEqual([404, 'GOAL_NOT_FOUND'])
  })
})

describe('goal numbers', () => {
  it('say how much is left or over and what to save per month until the deadline', async () => {
    const bike = await account('savings', 'Bicicleta')
    const done = await account('savings', 'Notebook')
    const checking = await account('checking', 'Conta Y')
    const targetOn = '2030-06-15'
    await created(
      member.post(goalsPath, {
        name: 'Bicicleta',
        targetCents: 500_000,
        targetOn,
        accountId: bike,
      }),
    )
    await created(
      member.post(goalsPath, { name: 'Notebook', targetCents: 100_000, accountId: done }),
    )
    for (const [toAccountId, amountCents] of [
      [bike, 160_000],
      [done, 120_000],
    ] as const) {
      await owner.post(`${workspacePath}/entries`, {
        entryType: 'transfer',
        occurredOn: '2026-10-05',
        description: 'Guardar',
        amountCents,
        fromAccountId: checking,
        toAccountId,
      })
    }

    const all = await goals()
    expect(all.find((goal) => goal.name === 'Bicicleta')).toMatchObject({
      savedCents: 160_000,
      percent: 32,
      remainingCents: 340_000,
      overCents: 0,
      monthlyToTargetCents: Math.ceil(340_000 / monthsUntil(targetOn, todayInSaoPaulo())),
    })
    expect(all.find((goal) => goal.name === 'Notebook')).toMatchObject({
      percent: 100,
      remainingCents: 0,
      overCents: 20_000,
      monthlyToTargetCents: null,
    })

    const preview = await viewer.get(
      `${goalsPath}/preview?targetCents=200000&accountId=${bike}&targetOn=${targetOn}`,
    )
    expect(await preview.json()).toEqual({
      savedCents: 160_000,
      monthlyToTargetCents: Math.ceil(40_000 / monthsUntil(targetOn, todayInSaoPaulo())),
    })
  })

  it('refuse a preview on an account that holds no money or without a deadline', async () => {
    const category = await account('expense_category', 'Mercado')
    const onCategory = await viewer.get(
      `${goalsPath}/preview?targetCents=1000&accountId=${category}&targetOn=2030-01-01`,
    )
    expect([onCategory.status, await codeOf(onCategory)]).toEqual([400, 'GOAL_ACCOUNT_INVALID'])

    const noDeadline = await viewer.get(
      `${goalsPath}/preview?targetCents=1000&accountId=${category}`,
    )
    expect([noDeadline.status, await codeOf(noDeadline)]).toEqual([400, 'GOAL_QUERY_INVALID'])
  })
})
