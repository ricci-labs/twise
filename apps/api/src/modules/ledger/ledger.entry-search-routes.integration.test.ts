import { createApp } from '@api/app'
import type { EntryItem } from '@api/modules/ledger'
import { testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { addMemberWithSystemRole, loggedInUser, requestsAs } from '@api/testing/http'
import type { SessionRequests } from '@api/testing/testing.types'
import type { Page } from '@financas/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const app = createApp(testAppDeps({ db: databases.app }))

let owner: SessionRequests
let viewer: SessionRequests
let workspacePath: string
let entriesPath: string
let ownerId: string
let memberId: string
let checkingId: string
let savingsId: string
let groceriesId: string
let marketId: string
let bakeryId: string
let leisureId: string
let salaryId: string
let cardId: string

beforeAll(async () => {
  const ownerSession = await loggedInUser(app, databases.app, fixtures.runId, 'search-owner')
  const memberSession = await loggedInUser(app, databases.app, fixtures.runId, 'search-member')
  const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'search-viewer')
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(ownerSession.userId, 'Search')
  for (const [session, role] of [
    [memberSession, 'member'],
    [viewerSession, 'viewer'],
  ] as const) {
    await addMemberWithSystemRole(databases.app, databases.owner, workspaceId, session.userId, role)
  }
  owner = requestsAs(app, ownerSession)
  viewer = requestsAs(app, viewerSession)
  ownerId = ownerSession.userId
  memberId = memberSession.userId
  workspacePath = `/api/workspaces/${workspaceId}`
  entriesPath = `${workspacePath}/entries`
  checkingId = await createdAccount({ kind: 'checking', name: 'Conta X' })
  savingsId = await createdAccount({ kind: 'savings', name: 'Poupança' })
  groceriesId = await createdAccount({ kind: 'expense_category', name: 'Mercado' })
  marketId = await createdAccount({
    kind: 'expense_category',
    name: 'Feira',
    parentId: groceriesId,
  })
  bakeryId = await createdAccount({
    kind: 'expense_category',
    name: 'Padaria',
    parentId: groceriesId,
  })
  leisureId = await createdAccount({ kind: 'expense_category', name: 'Lazer' })
  salaryId = await createdAccount({
    kind: 'income_category',
    name: 'Salário',
    incomeNature: 'fixed',
  })
  const card = await owner.post(`${workspacePath}/cards`, {
    name: 'Cartão X',
    closingDay: 25,
    dueDay: 4,
  })
  cardId = ((await card.json()) as { accountId: string }).accountId
  const contact = (await (
    await owner.post(`${workspacePath}/contacts`, { name: 'Contact J' })
  ).json()) as { contactId: string }

  await record(expense('Mercado da semana', groceriesId, '2026-10-20', ownerId))
  await record(expense('Feira de sábado', marketId, '2026-10-17', memberId))
  await record(expense('Pão da manhã', bakeryId, '2026-10-16', ownerId))
  await record({
    ...expense('Cinema com Contact J', leisureId, '2026-10-15', memberId),
    shares: [{ contactId: contact.contactId, amountCents: 3_000 }],
  })
  await record({
    entryType: 'card_purchase',
    occurredOn: '2026-10-12',
    description: 'Geladeira',
    amountCents: 300_000,
    installmentCount: 10,
    cardAccountId: cardId,
    categoryId: groceriesId,
    spentByUserId: ownerId,
  })
  await record({
    entryType: 'income',
    occurredOn: '2026-10-05',
    description: 'Salário A',
    amountCents: 500_000,
    receivedInAccountId: checkingId,
    categoryId: salaryId,
  })
  await record({
    entryType: 'transfer',
    occurredOn: '2026-10-06',
    description: 'Reserva',
    amountCents: 60_000,
    fromAccountId: checkingId,
    toAccountId: savingsId,
  })
  await record(expense('Mercado de setembro', groceriesId, '2026-09-20', ownerId))
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

async function createdAccount(body: object): Promise<string> {
  const response = await owner.post(`${workspacePath}/accounts`, body)
  return ((await response.json()) as { accountId: string }).accountId
}

async function record(body: object): Promise<void> {
  const response = await owner.post(entriesPath, body)
  if (response.status !== 201) {
    throw new Error(`Entry not recorded: ${await response.text()}`)
  }
}

function expense(description: string, categoryId: string, occurredOn: string, spentBy: string) {
  return {
    entryType: 'expense',
    occurredOn,
    description,
    amountCents: 5_000,
    paidFromAccountId: checkingId,
    categoryId,
    spentByUserId: spentBy,
  }
}

const OCTOBER = 'from=2026-10-05&to=2026-11-04'

async function descriptions(query: string): Promise<string[]> {
  const response = await viewer.get(`${entriesPath}?${query}`)
  expect(response.status).toBe(200)
  const page = (await response.json()) as Page<EntryItem>
  return page.items.map((item) => item.description)
}

describe('GET /entries search and filters', () => {
  it('searches descriptions ignoring case and accents, inside the period or in every period', async () => {
    expect(await descriptions(`${OCTOBER}&q=MERCADO`)).toEqual(['Mercado da semana'])
    expect(await descriptions(`${OCTOBER}&q=pao`)).toEqual(['Pão da manhã'])
    expect(await descriptions('q=mercado')).toEqual(['Mercado da semana', 'Mercado de setembro'])
  })

  it('filters by one or more types', async () => {
    expect(await descriptions(`${OCTOBER}&types=income,transfer`)).toEqual(['Reserva', 'Salário A'])
    expect(await descriptions(`${OCTOBER}&types=card_purchase&types=income`)).toEqual([
      'Geladeira',
      'Salário A',
    ])
  })

  it('finds a category with its subcategories, and a subcategory alone', async () => {
    expect(await descriptions(`${OCTOBER}&categoryId=${groceriesId}`)).toEqual([
      'Mercado da semana',
      'Feira de sábado',
      'Pão da manhã',
      'Geladeira',
    ])
    expect(await descriptions(`${OCTOBER}&categoryId=${marketId}`)).toEqual(['Feira de sábado'])
  })

  it('filters by who spent and by entries shared with contacts', async () => {
    expect(await descriptions(`${OCTOBER}&spentByUserId=${memberId}`)).toEqual([
      'Feira de sábado',
      'Cinema com Contact J',
    ])
    expect(await descriptions(`${OCTOBER}&shared=true`)).toEqual(['Cinema com Contact J'])
  })

  it('combines the filters with the search and pages 50 at a time by default', async () => {
    expect(await descriptions(`${OCTOBER}&types=expense&categoryId=${groceriesId}&q=da`)).toEqual([
      'Mercado da semana',
      'Pão da manhã',
    ])
    const page = (await (await viewer.get(entriesPath)).json()) as Page<EntryItem>
    expect(page.items.length).toBeLessThanOrEqual(50)
  })

  it('refuses a one-letter search and an unknown type', async () => {
    for (const query of ['q=a', 'types=gift', 'shared=yes']) {
      const response = await viewer.get(`${entriesPath}?${query}`)
      const body = (await response.json()) as { error: { code: string } }
      expect([response.status, body.error.code]).toEqual([400, 'ENTRY_QUERY_INVALID'])
    }
  })
})
