import { createApp } from '@api/app'
import type {
  AccountBalance,
  AccountsSummary,
  CardSummary,
  UpcomingInvoice,
} from '@api/modules/ledger'
import { testAppDeps } from '@api/testing/app'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import { addMemberWithSystemRole, loggedInUser, requestsAs } from '@api/testing/http'
import type { SessionRequests } from '@api/testing/testing.types'
import { addDays, type CardCycle, invoiceForPurchase, todayIn } from '@financas/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const app = createApp(testAppDeps({ db: databases.app }))
const TODAY = todayIn('America/Sao_Paulo', new Date())
const CARD_X: CardCycle = { closingDay: 25, dueDay: 4, purchaseOnClosingDayGoesNext: true }
const CARD_Y: CardCycle = { closingDay: 2, dueDay: 10, purchaseOnClosingDayGoesNext: true }
const LIMIT_X = 600_000

let owner: SessionRequests
let viewer: SessionRequests
let workspacePath: string
let cardX: string
let cardY: string
let archivedCard: string

beforeAll(async () => {
  const ownerSession = await loggedInUser(app, databases.app, fixtures.runId, 'summary-owner')
  const viewerSession = await loggedInUser(app, databases.app, fixtures.runId, 'summary-viewer')
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(ownerSession.userId, 'Summary')
  await addMemberWithSystemRole(
    databases.app,
    databases.owner,
    workspaceId,
    viewerSession.userId,
    'viewer',
  )
  owner = requestsAs(app, ownerSession)
  viewer = requestsAs(app, viewerSession)
  workspacePath = `/api/workspaces/${workspaceId}`

  const checking = await createdId(owner.post(`${workspacePath}/accounts`, account('checking')))
  const savings = await createdId(owner.post(`${workspacePath}/accounts`, account('savings')))
  const wallet = await createdId(owner.post(`${workspacePath}/accounts`, account('cash_wallet')))
  const groceries = await createdId(
    owner.post(`${workspacePath}/accounts`, account('expense_category')),
  )
  await openWith(checking, 420_000)
  await openWith(savings, 1_200_000)
  await openWith(wallet, 15_000)
  await owner.post(`${workspacePath}/accounts/${wallet}/archive`)

  cardX = await createdId(
    owner.post(`${workspacePath}/cards`, { name: 'Cartão X', limitCents: LIMIT_X, ...CARD_X }),
  )
  cardY = await createdId(owner.post(`${workspacePath}/cards`, { name: 'Cartão Y', ...CARD_Y }))
  archivedCard = await createdId(
    owner.post(`${workspacePath}/cards`, { name: 'Cartão Z', ...CARD_Y }),
  )
  await owner.post(`${workspacePath}/accounts/${archivedCard}/archive`)

  await buy(cardX, groceries, 195_000, 1)
  await buy(cardX, groceries, 90_000, 3)
  await buy(cardY, groceries, 62_000, 1)
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

function account(kind: string) {
  return { kind, name: `${kind} ${fixtures.runId}` }
}

async function createdId(response: Promise<Response>): Promise<string> {
  const body = (await (await response).json()) as { accountId?: string; entryId?: string }
  const id = body.accountId ?? body.entryId
  if (!id) {
    throw new Error(`Nothing was created: ${JSON.stringify(body)}`)
  }
  return id
}

function openWith(accountId: string, balanceCents: number) {
  return createdId(
    owner.post(`${workspacePath}/entries`, {
      entryType: 'opening_balance',
      occurredOn: addDays(TODAY, -30),
      description: 'Saldo inicial',
      balanceCents,
      accountId,
    }),
  )
}

function buy(cardAccountId: string, categoryId: string, amountCents: number, count: number) {
  return createdId(
    owner.post(`${workspacePath}/entries`, {
      entryType: 'card_purchase',
      occurredOn: TODAY,
      description: 'Compra',
      amountCents,
      installmentCount: count,
      cardAccountId,
      categoryId,
    }),
  )
}

async function read<T>(path: string, as = viewer): Promise<T> {
  const response = await as.get(`${workspacePath}${path}`)
  expect(response.status).toBe(200)
  return (await response.json()) as T
}

async function openCentsOf(accountId: string): Promise<number> {
  const balances = await read<AccountBalance[]>('/balances')
  return balances.find((balance) => balance.accountId === accountId)?.naturalBalanceCents ?? 0
}

function monthOf(cycle: CardCycle, from = TODAY): string {
  return `${invoiceForPurchase(from, cycle).referenceMonth}-01`
}

function nextAfter(cycle: CardCycle) {
  return invoiceForPurchase(addDays(invoiceForPurchase(TODAY, cycle).closingOn, 1), cycle)
}

describe('GET /accounts/summary', () => {
  it('adds the active money accounts and the cards, and names the next invoice to pay', async () => {
    const summary = await read<AccountsSummary>('/accounts/summary')
    const openX = await openCentsOf(cardX)
    const openY = await openCentsOf(cardY)
    const soonest = [CARD_X, CARD_Y]
      .map((cycle) => invoiceForPurchase(TODAY, cycle))
      .sort((first, second) => first.dueOn.localeCompare(second.dueOn))[0]

    expect(summary).toMatchObject({
      moneyTotalCents: 1_620_000,
      moneyAccountCount: 2,
      cardsOpenCents: openX + openY,
      cardCount: 2,
    })
    expect(openX).toBe(195_000 + 90_000)
    expect(summary.nextInvoice).toMatchObject({ dueOn: soonest?.dueOn })
    expect(summary.nextInvoice?.dueCents).toBeGreaterThan(0)
  })
})

describe('GET /cards', () => {
  it("gives each card what it owes, how much of its limit that is, and the invoice it's on now", async () => {
    const cards = await read<CardSummary[]>('/cards')
    const x = cards.find((card) => card.accountId === cardX)
    const y = cards.find((card) => card.accountId === cardY)
    const current = invoiceForPurchase(TODAY, CARD_X)

    expect(x).toMatchObject({
      openCents: 285_000,
      limitUsedPercent: Math.round((285_000 * 100) / LIMIT_X),
      currentInvoice: {
        referenceMonth: monthOf(CARD_X),
        closingOn: current.closingOn,
        dueOn: current.dueOn,
        status: 'open',
        totalCents: 195_000 + 30_000,
        dueCents: 195_000 + 30_000,
      },
    })
    expect(x?.currentInvoice.invoiceId).toEqual(expect.any(String))
    expect(y).toMatchObject({ openCents: 62_000, limitUsedPercent: null })
    expect(cards.find((card) => card.accountId === archivedCard)?.archivedAt).not.toBeNull()
  })
})

describe('GET /cards/invoices/upcoming', () => {
  it('lists the open and the next invoice of each active card, the soonest due first, even an empty one', async () => {
    const upcoming = await read<UpcomingInvoice[]>('/cards/invoices/upcoming')
    const nextY = nextAfter(CARD_Y)

    expect(upcoming).toHaveLength(4)
    expect(upcoming.map((invoice) => invoice.dueOn)).toEqual(
      [...upcoming.map((invoice) => invoice.dueOn)].sort(),
    )
    expect(upcoming.every((invoice) => invoice.cardAccountId !== archivedCard)).toBe(true)
    expect(upcoming.find((invoice) => invoice.dueOn === nextAfter(CARD_X).dueOn)).toMatchObject({
      cardAccountId: cardX,
      status: 'future',
      totalCents: 30_000,
    })
    expect(
      upcoming.find((invoice) => invoice.cardAccountId === cardY && invoice.dueOn === nextY.dueOn),
    ).toMatchObject({ invoiceId: null, totalCents: 0, dueCents: 0, status: 'future' })
  })

  it('stops at the limit asked for and refuses one outside 1 to 24', async () => {
    expect(await read<UpcomingInvoice[]>('/cards/invoices/upcoming?limit=1')).toHaveLength(1)
    for (const limit of ['0', '25']) {
      const response = await viewer.get(`${workspacePath}/cards/invoices/upcoming?limit=${limit}`)
      expect(response.status).toBe(400)
      const body = (await response.json()) as { error: { code: string } }
      expect(body.error.code).toBe('UPCOMING_INVOICE_QUERY_INVALID')
    }
  })
})
