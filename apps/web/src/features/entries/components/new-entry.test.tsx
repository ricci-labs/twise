import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { demoAnswers } from '@web/testing/demo-api'
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
import { type Locator, page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const CHECKING = '00000000-0000-4000-8000-0000000000c1'
const WALLET = '00000000-0000-4000-8000-0000000000c2'
const GROCERIES = '00000000-0000-4000-8000-0000000000e1'
const MARKET = '00000000-0000-4000-8000-0000000000e2'
const LEISURE = '00000000-0000-4000-8000-0000000000e3'
const CURRENT_USER = '00000000-0000-4000-8000-0000000000a1'

function ledgerAccount(id: string, kind: string, name: string, parentId: string | null = null) {
  return {
    id,
    parentId,
    kind,
    class: kind.endsWith('category') ? 'expense' : 'asset',
    name,
    currency: 'BRL',
    incomeNature: null,
    ownerUserId: null,
    isSystem: false,
    sortOrder: 0,
    color: null,
    icon: null,
    archivedAt: null,
  }
}

const ACCOUNTS = [
  ledgerAccount(CHECKING, 'checking', 'Conta X'),
  ledgerAccount(WALLET, 'cash_wallet', 'Carteira'),
  ledgerAccount(LEISURE, 'expense_category', 'Lazer'),
  ledgerAccount(GROCERIES, 'expense_category', 'Mercado'),
  ledgerAccount(MARKET, 'expense_category', 'Feira', GROCERIES),
]

function latestExpense(accountId: string, categoryId: string) {
  return {
    id: crypto.randomUUID(),
    entryType: 'expense',
    occurredOn: '2026-10-10',
    description: 'Mercado da semana',
    notes: null,
    paymentMethod: null,
    installmentCount: 1,
    spentByUserId: null,
    createdByUserId: 'user-a',
    source: 'web',
    replacesEntryId: null,
    postings: [categoryId, accountId].map((id, lineNo) => ({
      lineNo,
      accountId: id,
      accountKind: id === accountId ? 'cash_wallet' : 'expense_category',
      amountCents: lineNo === 0 ? 8640 : -8640,
      effectiveOn: '2026-10-10',
      invoiceId: null,
      installmentNo: null,
      contactId: null,
    })),
  }
}

function entryAnswers(recorded: unknown[], recordAnswer?: FakeAnswer) {
  return {
    [`GET ${BASE}/accounts`]: () => Response.json(ACCOUNTS),
    [`GET ${BASE}/balances`]: () =>
      Response.json([
        {
          accountId: CHECKING,
          kind: 'checking',
          class: 'asset',
          balanceCents: 420000,
          naturalBalanceCents: 420000,
        },
        {
          accountId: WALLET,
          kind: 'cash_wallet',
          class: 'asset',
          balanceCents: 15000,
          naturalBalanceCents: 15000,
        },
      ]),
    [`GET ${BASE}/members`]: () => Response.json([]),
    [`GET ${BASE}/entries`]: () =>
      Response.json({ items: [latestExpense(WALLET, GROCERIES)], nextCursor: null }),
    [`POST ${BASE}/entries`]: async (request: Request) => {
      recorded.push(await request.json())
      return recordAnswer
        ? recordAnswer(request)
        : Response.json({ entryId: 'entry-1' }, { status: 201 })
    },
  }
}

async function openNewEntry({
  recordAnswer,
  access = workspaceAccess,
}: {
  recordAnswer?: FakeAnswer
  access?: FakeAnswer
} = {}) {
  const recorded: unknown[] = []
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({
        userId: CURRENT_USER,
        email: 'member.a@exemplo.com',
        displayName: 'Member A',
      }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...demoAnswers(),
    ...entryAnswers(recorded, recordAnswer),
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}?entry=new`] }))
  await render(<AppProviders app={app} />)
  return { app, recorded }
}

async function expectText(locator: Locator, pattern: RegExp) {
  await expect.element(locator).toBeVisible()
  await expect.poll(() => locator.element().textContent).toMatch(pattern)
}

async function fillExpense() {
  await page.getByLabelText(/^Valor/).fill('86,4')
  await page.getByLabelText(/^Descrição/).fill('Mercado da semana')
  await page.getByRole('button', { name: /^Categoria/ }).click()
  await page.getByRole('button', { name: /^Mercado/ }).click()
  await page.getByRole('radio', { name: 'Feira' }).click()
}

describe('ENT-02 new expense', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('opens with the focus on the amount and the account used last time', async () => {
    await openNewEntry()
    const dialog = page.getByRole('dialog', { name: 'Novo lançamento' })

    await expect.element(dialog).toBeVisible()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveFocus()
    await expectText(page.getByRole('button', { name: /^Pago com/ }), /Carteira/)
    await expect
      .element(page.getByRole('button', { name: 'Salvar lançamento' }))
      .toHaveAttribute('aria-disabled', 'true')
  })

  it('has no accessibility violations in the form', async () => {
    await openNewEntry()
    const dialog = page.getByRole('dialog', { name: 'Novo lançamento' })
    await expect.element(dialog).toBeVisible()

    await expectNoAccessibilityViolations(dialog.element())
  })

  it('puts the most used category first and reads a subcategory with its parent', async () => {
    await openNewEntry()
    await page.getByRole('button', { name: /^Categoria/ }).click()
    await expect.element(page.getByRole('button', { name: /^Lazer/ })).toBeVisible()
    const tiles = await page.getByRole('button', { name: /^(Mercado|Lazer)/ }).elements()

    expect(tiles.map((tile) => tile.textContent)).toEqual(['MMercado1 sub', 'LLazer'])
    await page.getByRole('button', { name: /^Mercado/ }).click()
    await page.getByRole('radio', { name: 'Feira' }).click()

    await expectText(page.getByRole('button', { name: /^Categoria/ }), /Mercado›Feira/)
  })

  it('records the expense, confirms it and closes', async () => {
    const { app, recorded } = await openNewEntry()
    await fillExpense()

    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    await expect
      .element(page.getByRole('dialog', { name: 'Novo lançamento' }))
      .not.toBeInTheDocument()
    expect(recorded).toEqual([
      expect.objectContaining({
        entryType: 'expense',
        amountCents: 8640,
        description: 'Mercado da semana',
        paidFromAccountId: WALLET,
        categoryId: MARKET,
        spentByUserId: CURRENT_USER,
      }),
    ])
    expect(app.router.state.location.search).not.toHaveProperty('entry')
  })

  it('keeps the date and account after "Salvar e registrar outro" and goes back to the amount', async () => {
    const { recorded } = await openNewEntry()
    await fillExpense()
    await page.getByRole('radio', { name: 'Ontem' }).click()

    await page.getByRole('button', { name: 'Salvar e registrar outro' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('')
    await expect.element(page.getByLabelText(/^Valor/)).toHaveFocus()
    await expect.element(page.getByLabelText(/^Descrição/)).toHaveValue('')
    await expectText(page.getByRole('button', { name: /^Pago com/ }), /Carteira/)
    await expect.element(page.getByRole('radio', { name: 'Ontem' })).toBeChecked()
    expect(recorded).toHaveLength(1)
  })

  it('says what is missing when saving too early', async () => {
    const { recorded } = await openNewEntry()
    await page.getByLabelText(/^Descrição/).fill('Mercado da semana')

    await page.getByRole('button', { name: 'Salvar lançamento' }).click({ force: true })

    await expect
      .element(page.getByText('Informe um valor maior que zero, como 25,90.'))
      .toBeVisible()
    await expect.element(page.getByText('Escolha uma categoria.')).toBeVisible()
    expect(recorded).toEqual([])
  })

  it('places an API error on the field it concerns, and any other with its code', async () => {
    const unavailable = () => apiError('ACCOUNT_NOT_AVAILABLE', 422)
    await openNewEntry({ recordAnswer: unavailable })
    await fillExpense()

    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect
      .element(page.getByRole('button', { name: /^Pago com/ }))
      .toHaveAttribute('aria-invalid', 'true')
  })

  it('shows the error code when the save fails for another reason', async () => {
    await openNewEntry({ recordAnswer: () => apiError('INTERNAL', 500) })
    await fillExpense()

    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect
      .element(page.getByText('Não foi possível registrar o lançamento. Código: abcd1234.'))
      .toBeVisible()
  })

  it('asks before throwing away what was typed', async () => {
    await openNewEntry()
    await page.getByLabelText(/^Valor/).fill('12')

    await page.getByRole('button', { name: 'Cancelar' }).first().click()
    await page.getByRole('button', { name: 'Continuar editando' }).click()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('12,00')

    await page.getByRole('button', { name: 'Cancelar' }).first().click()
    await page.getByRole('button', { name: 'Descartar' }).click()
    await expect
      .element(page.getByRole('dialog', { name: 'Novo lançamento' }))
      .not.toBeInTheDocument()
  })

  it('opens as a dialog with the buttons in one row on the desktop', async () => {
    await page.viewport(1440, 900)
    await openNewEntry()
    await expect.element(page.getByRole('dialog', { name: 'Novo lançamento' })).toBeVisible()
    const footer = page.getByRole('button', { name: 'Salvar lançamento' }).element().parentElement

    expect(footer?.querySelectorAll('button')).toHaveLength(3)
    expect(getComputedStyle(footer as Element).flexDirection).toBe('row-reverse')
  })

  it('offers to register the first account and opens its form over the entry', async () => {
    const recorded: unknown[] = []
    fakeApi({
      'GET /api/auth/me': () =>
        Response.json({
          userId: CURRENT_USER,
          email: 'member.a@exemplo.com',
          displayName: 'Member A',
        }),
      'GET /api/workspaces': () => workspaceList(),
      [`GET ${BASE}`]: workspaceAccess,
      ...demoAnswers(),
      ...entryAnswers(recorded),
      [`GET ${BASE}/accounts`]: () =>
        Response.json(ACCOUNTS.filter((account) => account.class !== 'asset')),
    })
    const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}?entry=new`] }))
    await render(<AppProviders app={app} />)

    await page.getByRole('button', { name: /^Pago com/ }).click()
    await page.getByRole('button', { name: 'Cadastrar conta' }).click()

    await expect.element(page.getByRole('dialog', { name: 'Nova conta' })).toBeVisible()
    expect(app.router.state.location.search).toEqual({ entry: 'new', account: 'new' })
  })

  it('stays closed for someone who cannot record entries', async () => {
    await openNewEntry({
      access: () => accessAs('Visualizador', VIEWER_PERMISSIONS),
    })
    await expect.element(page.getByRole('heading', { name: /Livre para gastar/ })).toBeVisible()
    await expect
      .element(page.getByRole('dialog', { name: 'Novo lançamento' }))
      .not.toBeInTheDocument()
  })
})
