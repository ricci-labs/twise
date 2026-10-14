import { createApp } from '@api/app'
import type { EntrySuggestion } from '@api/modules/ledger'
import { testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { addMemberWithSystemRole, loggedInUser, requestsAs } from '@api/testing/http'
import type { SessionRequests } from '@api/testing/testing.types'
import { addDays, type IsoDate, todayIn } from '@financas/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const app = createApp(testAppDeps({ db: databases.app }))
const TODAY = todayIn('America/Sao_Paulo', new Date())

let owner: SessionRequests
let member: SessionRequests
let viewer: SessionRequests
let workspacePath: string
let entriesPath: string
let checkingId: string
let walletId: string
let groceriesId: string
let leisureId: string
let salaryId: string
let cardId: string

beforeAll(async () => {
  const ownerSession = await loggedInUser(app, databases.app, fixtures.runId, 'suggest-owner')
  const memberSession = await loggedInUser(app, databases.app, fixtures.runId, 'suggest-member')
  const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'suggest-viewer')
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(ownerSession.userId, 'Suggest')
  const foreign = await fixtures.createWorkspaceOwnedBy(memberSession.userId, 'Foreign')
  await addMemberWithSystemRole(
    databases.app,
    databases.owner,
    workspaceId,
    memberSession.userId,
    'member',
  )
  await addMemberWithSystemRole(
    databases.app,
    databases.owner,
    workspaceId,
    viewerSession.userId,
    'viewer',
  )
  owner = requestsAs(app, ownerSession)
  member = requestsAs(app, memberSession)
  viewer = requestsAs(app, viewerSession)
  workspacePath = `/api/workspaces/${workspaceId}`
  entriesPath = `${workspacePath}/entries`
  checkingId = await createdAccount({ kind: 'checking', name: 'Conta X' })
  walletId = await createdAccount({ kind: 'cash_wallet', name: 'Carteira' })
  groceriesId = await createdAccount({ kind: 'expense_category', name: 'Mercado' })
  leisureId = await createdAccount({ kind: 'expense_category', name: 'Lazer' })
  salaryId = await createdAccount({
    kind: 'income_category',
    name: 'Salário',
    incomeNature: 'fixed',
  })
  cardId = await createdId(
    owner.post(`${workspacePath}/cards`, { name: 'Card X', closingDay: 3, dueDay: 10 }),
  )

  await record(member, expense('Mercado da semana', addDays(TODAY, -20), 8000))
  await record(member, {
    ...expense('mercado da SEMANA', addDays(TODAY, -6), 8640),
    paymentMethod: 'pix',
  })
  await record(member, expense('Açougue', addDays(TODAY, -3), 4500))
  await record(member, expense('Mercadinho', addDays(TODAY, -2), 1200))
  await record(member, expense('Supermercado', addDays(TODAY, -1), 23_000))
  await record(owner, {
    entryType: 'income',
    occurredOn: addDays(TODAY, -4),
    description: 'Mercado Livre (venda)',
    amountCents: 5000,
    receivedInAccountId: checkingId,
    categoryId: salaryId,
  })
  await record(owner, {
    entryType: 'card_purchase',
    occurredOn: TODAY,
    description: 'Tênis de corrida',
    amountCents: 100_000,
    installmentCount: 3,
    cardAccountId: cardId,
    categoryId: leisureId,
  })
  const foreignChecking = await createdId(
    member.post(`/api/workspaces/${foreign.workspaceId}/accounts`, {
      kind: 'checking',
      name: 'Alheia',
    }),
  )
  const foreignCategory = await createdId(
    member.post(`/api/workspaces/${foreign.workspaceId}/accounts`, {
      kind: 'expense_category',
      name: 'Alheia',
    }),
  )
  await record(
    member,
    {
      entryType: 'expense',
      occurredOn: TODAY,
      description: 'Mercado alheio',
      amountCents: 999,
      paidFromAccountId: foreignChecking,
      categoryId: foreignCategory,
    },
    `/api/workspaces/${foreign.workspaceId}/entries`,
  )
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

function createdAccount(body: Record<string, unknown>): Promise<string> {
  return createdId(owner.post(`${workspacePath}/accounts`, body))
}

async function createdId(response: Promise<Response>): Promise<string> {
  const body = (await (await response).json()) as { accountId?: string; entryId?: string }
  const id = body.accountId ?? body.entryId
  if (!id) {
    throw new Error(`Nothing was created: ${JSON.stringify(body)}`)
  }
  return id
}

function expense(description: string, occurredOn: IsoDate, amountCents: number) {
  return {
    entryType: 'expense',
    occurredOn,
    description,
    amountCents,
    paidFromAccountId: checkingId,
    categoryId: groceriesId,
  }
}

function record(
  as: SessionRequests,
  body: Record<string, unknown>,
  path = entriesPath,
): Promise<string> {
  return createdId(as.post(path, body))
}

async function suggestions(query: string, as = viewer): Promise<EntrySuggestion[]> {
  const response = await as.get(`${entriesPath}/suggestions?${query}`)
  expect(response.status).toBe(200)
  return (await response.json()) as EntrySuggestion[]
}

async function frequent(query: string, as: SessionRequests): Promise<EntrySuggestion[]> {
  const response = await as.get(`${entriesPath}/frequent?${query}`)
  expect(response.status).toBe(200)
  return (await response.json()) as EntrySuggestion[]
}

async function codeOf(response: Response): Promise<string> {
  return ((await response.json()) as { error: { code: string } }).error.code
}

describe('GET /entries/suggestions', () => {
  it('suggests up to 3 recent descriptions of the type, one per description, as last used', async () => {
    const found = await suggestions('type=expense&q=merc')

    expect(found.map((item) => item.description)).toEqual([
      'Supermercado',
      'Mercadinho',
      'mercado da SEMANA',
    ])
    expect(found[2]).toEqual({
      description: 'mercado da SEMANA',
      categoryId: groceriesId,
      accountId: checkingId,
      paymentMethod: 'pix',
      lastAmountCents: 8640,
      lastUsedOn: addDays(TODAY, -6),
    })
  })

  it('ignores case and accents in the search', async () => {
    const found = await suggestions(`type=expense&q=${encodeURIComponent('ACOU')}`)
    expect(found.map((item) => item.description)).toEqual(['Açougue'])
  })

  it('keeps to the type asked for and to the workspace', async () => {
    const incomes = await suggestions('type=income&q=mercado')
    expect(incomes.map((item) => item.description)).toEqual(['Mercado Livre (venda)'])
    expect(incomes[0]).toMatchObject({ accountId: checkingId, categoryId: salaryId })

    const expenses = await suggestions('type=expense&q=alheio')
    expect(expenses).toEqual([])
  })

  it('gives a card purchase its card, category and the total of its installments', async () => {
    const [purchase] = await suggestions('type=card_purchase&q=tenis')
    expect(purchase).toEqual({
      description: 'Tênis de corrida',
      categoryId: leisureId,
      accountId: cardId,
      paymentMethod: 'credit',
      lastAmountCents: 100_000,
      lastUsedOn: TODAY,
    })
  })

  it('leaves out an account or category that is no longer active, and deleted entries', async () => {
    const pastryId = await createdAccount({ kind: 'expense_category', name: 'Padaria' })
    await record(member, {
      ...expense('Padaria do bairro', addDays(TODAY, -1), 1850),
      paidFromAccountId: walletId,
      categoryId: pastryId,
    })
    const deletedId = await record(member, expense('Pão de queijo', TODAY, 900))
    await owner.post(`${workspacePath}/accounts/${pastryId}/archive`)
    await owner.post(`${workspacePath}/accounts/${walletId}/archive`)
    await member.del(`${entriesPath}/${deletedId}`, {})

    const found = await suggestions('type=expense&q=pa')
    expect(found).toEqual([
      expect.objectContaining({
        description: 'Padaria do bairro',
        categoryId: null,
        accountId: null,
      }),
    ])
  })

  it('refuses a blank search or a type without a category', async () => {
    for (const query of ['type=expense&q=%20%20', 'type=transfer&q=pix', 'q=mercado']) {
      const response = await viewer.get(`${entriesPath}/suggestions?${query}`)
      expect(response.status).toBe(400)
      expect(await codeOf(response)).toBe('ENTRY_SUGGESTION_QUERY_INVALID')
    }
  })
})

describe('GET /entries/frequent', () => {
  it("lists the caller's repeated descriptions of the last 90 days, the most repeated first", async () => {
    for (const daysAgo of [100, 95]) {
      await record(member, expense('Feira antiga', addDays(TODAY, -daysAgo), 3000))
    }
    for (const daysAgo of [30, 9]) {
      await record(member, expense('Farmácia', addDays(TODAY, -daysAgo), 2500))
    }
    for (const daysAgo of [40, 20, 15]) {
      await record(member, expense('Uber', addDays(TODAY, -daysAgo), 2390))
    }
    for (const daysAgo of [7, 4]) {
      await record(owner, expense('Cinema', addDays(TODAY, -daysAgo), 6000))
    }

    const found = await frequent('type=expense', member)

    expect(found.map((item) => item.description)).toEqual(['Uber', 'mercado da SEMANA', 'Farmácia'])
    expect(found[0]).toMatchObject({ accountId: checkingId, lastAmountCents: 2390 })
    expect((await frequent('type=expense', owner)).map((item) => item.description)).toEqual([
      'Cinema',
    ])
    expect(await frequent('type=income', member)).toEqual([])
  })

  it('stops at the limit asked for', async () => {
    const found = await frequent('type=expense&limit=1', member)
    expect(found.map((item) => item.description)).toEqual(['Uber'])
  })

  it('refuses a limit outside 1 to 8', async () => {
    for (const query of ['type=expense&limit=0', 'type=expense&limit=9', 'type=refund']) {
      const response = await member.get(`${entriesPath}/frequent?${query}`)
      expect(response.status).toBe(400)
      expect(await codeOf(response)).toBe('FREQUENT_ENTRY_QUERY_INVALID')
    }
  })
})
