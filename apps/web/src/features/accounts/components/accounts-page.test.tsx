import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accessAs,
  apiError,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const MEMBER_A = '00000000-0000-4000-8000-0000000000a1'
const MEMBER_B = '00000000-0000-4000-8000-0000000000b1'
const CHECKING = '00000000-0000-4000-8000-0000000000c1'
const SAVINGS = '00000000-0000-4000-8000-0000000000c2'
const CARD = '00000000-0000-4000-8000-0000000000c3'
const OLD = '00000000-0000-4000-8000-0000000000c4'

function ledgerAccount(id: string, kind: string, name: string, extra: object = {}) {
  return {
    id,
    parentId: null,
    kind,
    class: kind === 'credit_card' ? 'liability' : 'asset',
    name,
    currency: 'BRL',
    incomeNature: null,
    ownerUserId: null,
    isSystem: false,
    sortOrder: 0,
    color: ACCOUNT_COLORS[0].value,
    icon: 'wallet',
    archivedAt: null,
    ...extra,
  }
}

const ACCOUNTS = [
  ledgerAccount(CHECKING, 'checking', 'Conta X', { ownerUserId: MEMBER_A }),
  ledgerAccount(SAVINGS, 'savings', 'Poupança'),
  ledgerAccount(CARD, 'credit_card', 'Cartão X', { ownerUserId: MEMBER_B, icon: 'card' }),
  ledgerAccount(OLD, 'checking', 'Conta antiga', { archivedAt: '2026-09-01T12:00:00.000Z' }),
  ledgerAccount('00000000-0000-4000-8000-0000000000c5', 'expense_category', 'Mercado'),
]

const INVOICE = {
  invoiceId: null,
  referenceMonth: '2026-11-01',
  closingOn: '2026-10-25',
  dueOn: '2026-11-04',
  status: 'open',
  totalCents: 195000,
  dueCents: 195000,
}

function accountsAnswers(overrides: Record<string, FakeAnswer> = {}) {
  return {
    [`GET ${BASE}/accounts`]: () => Response.json(ACCOUNTS),
    [`GET ${BASE}/balances`]: () =>
      Response.json(
        [CHECKING, SAVINGS, CARD, OLD].map((accountId, position) => ({
          accountId,
          kind: 'checking',
          class: 'asset',
          balanceCents: [420000, 1200000, -289000, 0][position],
          naturalBalanceCents: [420000, 1200000, 289000, 0][position],
        })),
      ),
    [`GET ${BASE}/accounts/summary`]: () =>
      Response.json({
        moneyTotalCents: 1620000,
        moneyAccountCount: 2,
        cardsOpenCents: 289000,
        cardCount: 1,
        nextInvoice: { ...INVOICE, cardAccountId: CARD },
      }),
    [`GET ${BASE}/cards`]: () =>
      Response.json([
        {
          accountId: CARD,
          name: 'Cartão X',
          color: null,
          icon: 'card',
          sortOrder: 0,
          archivedAt: null,
          closingDay: 25,
          dueDay: 4,
          purchaseOnClosingDayGoesNext: false,
          limitCents: null,
          holderUserId: MEMBER_B,
          paymentAccountId: CHECKING,
          openCents: 289000,
          limitUsedPercent: null,
          currentInvoice: INVOICE,
        },
      ]),
    [`GET ${BASE}/members`]: () =>
      Response.json([
        { userId: MEMBER_A, displayName: 'Member A' },
        { userId: MEMBER_B, displayName: 'Member B' },
      ]),
    ...overrides,
  }
}

async function openAccounts({
  access = workspaceAccess,
  answers = {},
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...accountsAnswers(answers),
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/accounts`] }))
  await render(<AppProviders app={app} />)
  return app
}

describe('ACC-01 accounts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sums the money, lists accounts and cards apart, and hides the archived ones', async () => {
    await openAccounts()

    await expect.element(page.getByRole('heading', { name: 'Dinheiro' })).toBeVisible()
    await expect.element(page.getByText('Total em dinheiro')).toBeVisible()
    await expect.element(page.getByText('Conta corrente · Member A')).toBeVisible()
    await expect.element(page.getByText('Poupança · da casa')).toBeVisible()
    await expect.element(page.getByText('Em aberto · fecha 25/10 · vence 04/11')).toBeVisible()
    await expect.element(page.getByText('Mercado')).not.toBeInTheDocument()
    await expect.element(page.getByText('Conta antiga')).not.toBeInTheDocument()

    await page.getByRole('button', { name: 'Arquivadas (1)' }).click()

    await expect.element(page.getByText('Conta antiga')).toBeVisible()
  })

  it('has no accessibility violations', async () => {
    await openAccounts()
    await expect.element(page.getByRole('heading', { name: 'Cartões' })).toBeVisible()

    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('archives an account and undoes it from the toast', async () => {
    const posted: string[] = []
    const record = (request: Request) => {
      posted.push(new URL(request.url).pathname)
      return new Response(null, { status: 204 })
    }
    await openAccounts({
      answers: {
        [`POST ${BASE}/accounts/${CHECKING}/archive`]: record,
        [`POST ${BASE}/accounts/${CHECKING}/unarchive`]: record,
      },
    })

    await page.getByRole('button', { name: 'Ações de Conta X' }).click()
    await page.getByRole('button', { name: 'Arquivar' }).click()
    await expect.element(page.getByText('Conta X arquivada.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()

    await expect
      .poll(() => posted)
      .toEqual([`${BASE}/accounts/${CHECKING}/archive`, `${BASE}/accounts/${CHECKING}/unarchive`])
  })

  it('offers to archive when the account cannot be deleted', async () => {
    const archived = vi.fn(() => new Response(null, { status: 204 }))
    await openAccounts({
      answers: {
        [`DELETE ${BASE}/accounts/${SAVINGS}`]: () => apiError('ACCOUNT_CANNOT_BE_DELETED', 409),
        [`POST ${BASE}/accounts/${SAVINGS}/archive`]: archived,
      },
    })

    await page.getByRole('button', { name: 'Ações de Poupança' }).click()
    await page.getByRole('button', { name: 'Excluir' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Não dá para excluir a Poupança' })
    await expect.element(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Arquivar' }).click()

    await expect.element(page.getByText('Poupança arquivada.')).toBeVisible()
    expect(archived).toHaveBeenCalledOnce()
  })

  it('shows the accounts without actions, owners or trash to a viewer', async () => {
    await openAccounts({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Conta X')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Conta X' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('link', { name: 'Lixeira de contas' }))
      .not.toBeInTheDocument()
    await expect.element(page.getByText('Conta corrente', { exact: true })).toBeVisible()
  })

  it('starts with an empty block when there is no account', async () => {
    await openAccounts({ answers: { [`GET ${BASE}/accounts`]: () => Response.json([]) } })

    await expect.element(page.getByText('Nenhuma conta ainda.')).toBeVisible()
    await expect.element(page.getByText('Total em dinheiro')).not.toBeInTheDocument()
  })

  it('says it could not load, with the code, and tries again', async () => {
    let calls = 0
    await openAccounts({
      answers: {
        [`GET ${BASE}/accounts`]: () => {
          calls += 1
          return calls === 1 ? apiError('ACCESS_DENIED', 403) : Response.json(ACCOUNTS)
        },
      },
    })

    await expect.element(page.getByText('Não foi possível carregar as contas.')).toBeVisible()
    await expect.element(page.getByText('Código: abcd1234')).toBeVisible()
    await page.getByRole('button', { name: 'Tentar de novo' }).click()

    await expect.element(page.getByText('Conta corrente · Member A')).toBeVisible()
  })
})
