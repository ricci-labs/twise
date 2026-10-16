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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type Locator, page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const CHECKING = '00000000-0000-4000-8000-0000000000c1'
const WALLET = '00000000-0000-4000-8000-0000000000c2'
const GROCERIES = '00000000-0000-4000-8000-0000000000e1'
const MARKET = '00000000-0000-4000-8000-0000000000e2'
const LEISURE = '00000000-0000-4000-8000-0000000000e3'
const CURRENT_USER = '00000000-0000-4000-8000-0000000000a1'
const CARD_X = '00000000-0000-4000-8000-0000000000c3'
const MEMBER_C = '00000000-0000-4000-8000-0000000000d1'
const MEMBER_D = '00000000-0000-4000-8000-0000000000d2'

function contact(id: string, name: string) {
  return {
    id,
    name,
    phoneE164: null,
    pixKey: null,
    notes: null,
    isOptedOut: false,
    isArchived: false,
  }
}

const CARD_SUMMARY = {
  accountId: CARD_X,
  name: 'Cartão X',
  color: null,
  icon: 'card',
  sortOrder: 0,
  archivedAt: null,
  createdAt: '2026-01-10T12:00:00.000Z',
  closingDay: 25,
  dueDay: 4,
  purchaseOnClosingDayGoesNext: false,
  limitCents: null,
  holderUserId: null,
  paymentAccountId: CHECKING,
  openCents: 0,
  limitUsedPercent: null,
  currentInvoice: {
    invoiceId: null,
    referenceMonth: '2026-11',
    closingOn: '2026-10-25',
    dueOn: '2026-11-04',
    status: 'open',
    totalCents: 0,
    dueCents: 0,
  },
}

const OPEN_INVOICE = '00000000-0000-4000-8000-0000000000b1'
const NEXT_INVOICE = '00000000-0000-4000-8000-0000000000b2'
const LATER_INVOICE = '00000000-0000-4000-8000-0000000000b3'

function invoiceTotal(invoiceId: string, month: string, status: string, dueCents: number) {
  return {
    invoiceId,
    referenceMonth: month,
    closingOn: `${month}-25`,
    dueOn: `${month}-04`,
    status,
    totalCents: dueCents,
    paidCents: 0,
    dueCents,
    frontedCents: 0,
    ownCents: dueCents,
  }
}

const MARKET_RUN = {
  description: 'Mercado da semana',
  categoryId: MARKET,
  accountId: WALLET,
  paymentMethod: 'pix',
  lastAmountCents: 8640,
  lastUsedOn: '2026-10-10',
}

const CARD_X_INVOICES = [
  invoiceTotal(LATER_INVOICE, '2027-01', 'future', 30_000),
  invoiceTotal(NEXT_INVOICE, '2026-12', 'future', 64_000),
  invoiceTotal(OPEN_INVOICE, '2026-11', 'open', 195_000),
  invoiceTotal('00000000-0000-4000-8000-0000000000b0', '2026-10', 'closed', 0),
]

function ledgerAccount(id: string, kind: string, name: string, parentId: string | null = null) {
  return {
    id,
    parentId,
    kind,
    class: CLASS_OF_KIND[kind] ?? 'asset',
    name,
    currency: 'BRL',
    incomeNature: kind === 'income_category' ? 'variable' : null,
    ownerUserId: null,
    isSystem: false,
    sortOrder: 0,
    color: null,
    icon: null,
    archivedAt: null,
  }
}

const CLASS_OF_KIND: Readonly<Record<string, string>> = {
  expense_category: 'expense',
  income_category: 'income',
}
const COMMISSION = '00000000-0000-4000-8000-0000000000f1'

const ACCOUNTS = [
  ledgerAccount(CHECKING, 'checking', 'Conta X'),
  ledgerAccount(WALLET, 'cash_wallet', 'Carteira'),
  ledgerAccount(LEISURE, 'expense_category', 'Lazer'),
  ledgerAccount(GROCERIES, 'expense_category', 'Mercado'),
  ledgerAccount(MARKET, 'expense_category', 'Feira', GROCERIES),
  ledgerAccount(COMMISSION, 'income_category', 'Comissão'),
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

function entryAnswers(
  recorded: unknown[],
  recordAnswer?: FakeAnswer,
  cards: readonly unknown[] = [CARD_SUMMARY],
) {
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
    [`GET ${BASE}/cards`]: () => Response.json(cards),
    [`GET ${BASE}/cards/${CARD_X}/invoices`]: () => Response.json(CARD_X_INVOICES),
    [`GET ${BASE}/entries/frequent`]: (request: Request) =>
      Response.json(
        new URL(request.url).searchParams.get('type') === 'expense' ? [MARKET_RUN] : [],
      ),
    [`GET ${BASE}/entries/suggestions`]: () => Response.json([MARKET_RUN]),
    [`GET ${BASE}/contacts/balances`]: () =>
      Response.json([
        {
          contactId: MEMBER_C,
          name: 'Member C',
          owedCents: 12_000,
          overdueCents: 0,
          nextDueOn: '2026-10-25',
          nextDueCents: 12_000,
        },
        {
          contactId: MEMBER_D,
          name: 'Member D',
          owedCents: 52_000,
          overdueCents: 20_000,
          nextDueOn: null,
          nextDueCents: 0,
        },
      ]),
    [`GET ${BASE}/contacts`]: () =>
      Response.json([contact(MEMBER_C, 'Member C'), contact(MEMBER_D, 'Member D')]),
    [`GET ${BASE}/entries`]: () =>
      Response.json({ items: [latestExpense(WALLET, GROCERIES)], nextCursor: null }),
    [`GET ${BASE}/occurrences/suggestions`]: () => Response.json([]),
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
  cards,
  search = '',
  answers = {},
}: {
  recordAnswer?: FakeAnswer
  access?: FakeAnswer
  cards?: readonly unknown[]
  search?: string
  answers?: Record<string, FakeAnswer>
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
    ...entryAnswers(recorded, recordAnswer, cards),
    ...answers,
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}?entry=new${search}`] }),
  )
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
    await page.getByRole('button', { name: 'Ver' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/entries/entry-1`)
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

async function fillCardPurchase(amount: string) {
  await page.getByRole('radio', { name: 'Compra no cartão' }).click()
  await page.getByLabelText(/^Valor/).fill(amount)
  await page.getByLabelText(/^Descrição/).fill('Tênis de corrida')
  await page.getByRole('button', { name: /^Categoria/ }).click()
  await page.getByRole('button', { name: /^Lazer/ }).click()
}

describe('ENT-02 card purchase', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
  })

  afterEach(async () => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('shows the invoice each installment lands on and records the purchase in 3×', async () => {
    const { recorded } = await openNewEntry()
    await fillCardPurchase('1000')

    await expectText(page.getByRole('button', { name: /^Cartão/ }), /Fecha 25\/10 · vence 04\/11/)
    await expect.element(page.getByText(/^Entra na fatura que vence em 04\/11/)).toBeVisible()
    await page.getByRole('button', { name: 'Mais uma parcela' }).click()
    await page.getByRole('button', { name: 'Mais uma parcela' }).click()

    await expect.element(page.getByText(/^3× de/)).toBeVisible()
    await expect
      .element(page.getByText(/^A 1ª parcela entra na fatura que vence em 04\/11/))
      .toBeVisible()
    await expect.element(page.getByText('vence 04/01/27')).toBeVisible()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        entryType: 'card_purchase',
        amountCents: 100_000,
        cardAccountId: CARD_X,
        categoryId: LEISURE,
        installmentCount: 3,
        firstInstallment: 1,
        paymentMethod: 'credit',
      }),
    ])
  })

  it('warns before saving when the first installment falls on a closed invoice, and starts later', async () => {
    const { recorded } = await openNewEntry()
    await fillCardPurchase('1000')
    await page.getByRole('button', { name: 'Mais uma parcela' }).click()
    await page.getByRole('button', { name: 'Mais uma parcela' }).click()
    await page.getByRole('radio', { name: 'Outra data' }).click()
    await page.getByRole('button', { name: 'Mês anterior' }).click()
    await page.getByRole('radio', { name: '20 de setembro' }).click()

    await expect
      .element(page.getByText('A fatura de outubro já fechou. Registre a partir da parcela 2.'))
      .toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Salvar lançamento' }))
      .toHaveAttribute('aria-disabled', 'true')
    await page.getByRole('button', { name: 'Começar da parcela 2' }).click()

    await expect.element(page.getByRole('switch', { name: 'Compra já em andamento' })).toBeChecked()
    await expect.element(page.getByText(/^Faltam 2 parcelas/)).toBeVisible()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()
    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        installmentCount: 3,
        firstInstallment: 2,
        occurredOn: '2026-09-20',
      }),
    ])
  })

  it('offers to register the first card when there is none', async () => {
    const { app } = await openNewEntry({ cards: [] })
    await page.getByRole('radio', { name: 'Compra no cartão' }).click()
    await page.getByRole('button', { name: /^Cartão/ }).click()

    await expect.element(page.getByText('Vocês ainda não têm um cartão.')).toBeVisible()
    await page.getByRole('button', { name: 'Cadastrar cartão' }).click()

    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({ entry: 'new', card: 'new' })
  })
})

async function addShare(name: string) {
  await page.getByRole('button', { name: /Dividir com contatos|Adicionar contato/ }).click()
  await page.getByRole('button', { name }).click()
}

describe('ENT-02 shares with contacts', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('splits a dinner equally, keeps your part live and records the shares', async () => {
    const { recorded } = await openNewEntry()
    await fillExpense()
    await page.getByLabelText(/^Valor/).fill('240')
    await addShare('Member C')
    await addShare('Member D')
    await page.getByRole('button', { name: 'Dividir igualmente' }).click()

    await expect
      .element(page.getByRole('textbox', { name: 'Parte de Member C' }))
      .toHaveValue('80,00')
    await expect
      .element(page.getByRole('textbox', { name: 'Parte de Member D' }))
      .toHaveValue('80,00')
    await expectText(
      page.getByRole('region', { name: 'Dividir com contatos' }),
      /Sua parte.*R\$\s80,00/,
    )
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        amountCents: 24_000,
        shares: [
          { contactId: MEMBER_C, amountCents: 8000 },
          { contactId: MEMBER_D, amountCents: 8000 },
        ],
      }),
    ])
  })

  it('blocks saving while the shares pass the total and leaves your part blank', async () => {
    const { recorded } = await openNewEntry()
    await fillExpense()
    await page.getByLabelText(/^Valor/).fill('240')
    await addShare('Member C')
    await page.getByRole('textbox', { name: 'Parte de Member C' }).fill('270')

    await expect.element(page.getByText('A soma das partes passa do valor total.')).toBeVisible()
    await expect
      .element(page.getByRole('textbox', { name: 'Parte de Member C' }))
      .toHaveAttribute('aria-invalid', 'true')
    await expect
      .element(page.getByRole('button', { name: 'Salvar lançamento' }))
      .toHaveAttribute('aria-disabled', 'true')
    await page.getByRole('button', { name: 'Metade' }).click()

    await expect
      .element(page.getByRole('textbox', { name: 'Parte de Member C' }))
      .toHaveValue('120,00')
    await expect
      .element(page.getByText('A soma das partes passa do valor total.'))
      .not.toBeInTheDocument()
    await page.getByRole('button', { name: 'Tirar Member C da divisão' }).click()
    await expect.element(page.getByRole('button', { name: 'Dividir com contatos' })).toBeVisible()
    expect(recorded).toEqual([])
  })

  it('asks for an amount in every share before saving', async () => {
    const { recorded } = await openNewEntry()
    await fillExpense()
    await addShare('Member D')
    await page.getByRole('button', { name: 'Salvar lançamento' }).click({ force: true })

    await expect.element(page.getByText('Informe um valor maior que zero.')).toBeVisible()
    expect(recorded).toEqual([])
  })
})

describe('ENT-02 income and transfer', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('records an income in the account it was received in, with its nature on the category', async () => {
    const { recorded } = await openNewEntry()
    await page.getByRole('radio', { name: 'Receita' }).click()
    await page.getByLabelText(/^Valor/).fill('1500')
    await page.getByLabelText(/^Descrição/).fill('Comissão de outubro')
    await page.getByRole('button', { name: /^Recebido em/ }).click()
    await page.getByRole('button', { name: /^Conta X/ }).click()
    await page.getByRole('button', { name: /^Categoria/ }).click()
    await page.getByRole('button', { name: /^Comissão/ }).click()

    await expectText(
      page.getByRole('button', { name: /^Categoria/ }),
      /ComissãoVariávelRenda variável/,
    )
    await expect
      .element(page.getByRole('radiogroup', { name: 'Quem gastou' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('button', { name: 'Dividir com contatos' }))
      .not.toBeInTheDocument()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        entryType: 'income',
        amountCents: 150_000,
        receivedInAccountId: CHECKING,
        categoryId: COMMISSION,
      }),
    ])
  })

  it('offers the commission split right after a variable income is saved', async () => {
    const { app } = await openNewEntry()
    await page.getByRole('radio', { name: 'Receita' }).click()
    await page.getByLabelText(/^Valor/).fill('1500')
    await page.getByLabelText(/^Descrição/).fill('Comissão de outubro')
    await page.getByRole('button', { name: /^Recebido em/ }).click()
    await page.getByRole('button', { name: /^Conta X/ }).click()
    await page.getByRole('button', { name: /^Categoria/ }).click()
    await page.getByRole('button', { name: /^Comissão/ }).click()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await page.getByRole('button', { name: 'Ver sugestão de divisão' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/commission-split`)
    expect(app.router.state.location.search).toMatchObject({ amount: 150_000 })
  })

  it('moves money between two different accounts', async () => {
    const { recorded } = await openNewEntry()
    await page.getByRole('radio', { name: 'Transferência' }).click()
    await page.getByLabelText(/^Valor/).fill('500')
    await page.getByLabelText(/^Descrição/).fill('Guardar para a viagem')
    await page.getByRole('button', { name: /^Para/ }).click()
    await page.getByRole('button', { name: /^Carteira/ }).click()

    await expect.element(page.getByText('Escolha uma conta diferente da de origem.')).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Categoria/ })).not.toBeInTheDocument()
    await expect.element(page.getByLabelText('Forma de pagamento')).not.toBeInTheDocument()
    await page.getByRole('button', { name: /^Para/ }).click()
    await page.getByRole('button', { name: /^Conta X/ }).click()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        entryType: 'transfer',
        amountCents: 50_000,
        fromAccountId: WALLET,
        toAccountId: CHECKING,
      }),
    ])
  })

  it('opens a part of the commission split with its band and description', async () => {
    await openNewEntry({
      search: `&entryType=transfer&entryToAccount=${CHECKING}&entryAmount=60000&entrySplitPart=1&entrySplitLabel=Poupan%C3%A7a%20(reserva)`,
    })

    await expect.element(page.getByText('Parte 1 da divisão da comissão')).toBeVisible()
    await expect.element(page.getByText(/^Poupança \(reserva\) · R\$.600,00$/)).toBeVisible()
    await expect
      .element(page.getByLabelText(/^Descrição/))
      .toHaveValue('Divisão da comissão: Poupança (reserva)')
  })

  it("opens as a transfer to a goal's account with the amount to save", async () => {
    await openNewEntry({
      search: `&entryType=transfer&entryToAccount=${CHECKING}&entryAmount=113400`,
    })

    await expect.element(page.getByRole('radio', { name: 'Transferência' })).toBeChecked()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('1.134,00')
    await expectText(page.getByRole('button', { name: /^Para/ }), /Conta X/)
  })
})

describe('ENT-02 opening balance', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('is one of the other types under "Mais" and records a negative balance', async () => {
    const { recorded } = await openNewEntry()
    await page.getByRole('radio', { name: 'Mais' }).click()
    await expect.element(page.getByText('O saldo de partida de uma conta')).toBeVisible()
    await expect.element(page.getByText(/^Informe um valor/)).not.toBeInTheDocument()
    await page.getByRole('button', { name: /^Saldo inicial/ }).click()

    await expect.element(page.getByRole('radio', { name: 'Saldo inicial' })).toBeChecked()
    await expect.element(page.getByLabelText(/^Descrição/)).toHaveValue('Saldo inicial')
    await expect.element(page.getByLabelText('Forma de pagamento')).not.toBeInTheDocument()
    await page.getByRole('button', { name: /^Conta/ }).click()
    await page.getByRole('button', { name: /^Conta X/ }).click()
    await expectText(page.getByRole('button', { name: /^Conta/ }), /Conta corrente/)
    await page.getByLabelText(/^Saldo/).fill('350')
    await page.getByRole('switch', { name: 'Negativo (cheque especial)' }).click()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        entryType: 'opening_balance',
        accountId: CHECKING,
        balanceCents: -35_000,
        description: 'Saldo inicial',
      }),
    ])
  })

  it('opens on an account from a link', async () => {
    await openNewEntry({ search: `&entryType=opening_balance&entryAccount=${CHECKING}` })

    await expect.element(page.getByRole('radio', { name: 'Saldo inicial' })).toBeChecked()
    await expectText(page.getByRole('button', { name: /^Conta/ }), /Conta XConta corrente/)
  })
})

describe('ENT-02 invoice payment', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
  })

  afterEach(async () => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('pays the oldest invoice with something due from the card default account', async () => {
    const { recorded } = await openNewEntry()
    await page.getByRole('radio', { name: 'Mais' }).click()
    await page.getByRole('button', { name: /^Pagamento de fatura/ }).click()

    await expect.element(page.getByRole('radio', { name: /^Vence 04\/11/ })).toBeChecked()
    await expect.element(page.getByRole('radio', { name: /^Vence 04\/12/ })).not.toBeChecked()
    await expect.element(page.getByRole('radio', { name: /^Vence 04\/01\/27/ })).not.toBeChecked()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('1.950,00')
    await expect
      .element(page.getByLabelText(/^Descrição/))
      .toHaveValue('Fatura Cartão X · vence 04/11')
    await expectText(page.getByRole('button', { name: /^Pago com/ }), /Conta padrão do cartão/)
    await page.getByLabelText(/^Valor/).fill('2000')

    await expect.element(page.getByText('O valor é maior que o saldo da fatura.')).toBeVisible()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        entryType: 'invoice_payment',
        amountCents: 200_000,
        cardAccountId: CARD_X,
        invoiceId: OPEN_INVOICE,
        paidFromAccountId: CHECKING,
      }),
    ])
  })

  it('opens on the invoice chosen on the card page', async () => {
    await openNewEntry({
      search: `&entryType=invoice_payment&entryCard=${CARD_X}&entryInvoice=${NEXT_INVOICE}`,
    })

    await expect.element(page.getByRole('radio', { name: /^Vence 04\/12/ })).toBeChecked()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('640,00')
  })

  it('fills the amount of another invoice when it is picked', async () => {
    await openNewEntry()
    await page.getByRole('radio', { name: 'Mais' }).click()
    await page.getByRole('button', { name: /^Pagamento de fatura/ }).click()
    await page.getByRole('radio', { name: /^Vence 04\/12/ }).click()

    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('640,00')
    await expect
      .element(page.getByLabelText(/^Descrição/))
      .toHaveValue('Fatura Cartão X · vence 04/12')
  })
})

describe('ENT-02 settlement', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('receives what a contact owes, saying what is due or overdue', async () => {
    const { recorded } = await openNewEntry()
    await page.getByRole('radio', { name: 'Mais' }).click()
    await page.getByRole('button', { name: /^Recebimento de contato/ }).click()
    await page.getByRole('button', { name: /^Contato/ }).click()

    const sheet = page.getByRole('dialog', { name: 'Contato' })
    await expect.element(sheet.getByText('Vence 25/10')).toBeVisible()
    await expect.element(sheet.getByText('R$ 200,00 em atraso')).toBeVisible()
    await page.getByRole('button', { name: /^Member C/ }).click()

    await expectText(
      page.getByRole('button', { name: /^Contato/ }),
      /deve R\$\s120,00 · vence 25\/10/,
    )
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('120,00')
    await expect.element(page.getByLabelText(/^Descrição/)).toHaveValue('Member C pagou')
    await page.getByLabelText(/^Valor/).fill('150')
    await expect.element(page.getByText('O valor é maior do que Member C deve.')).toBeVisible()
    await page.getByLabelText(/^Valor/).fill('120')
    await page.getByRole('button', { name: /^Recebido em/ }).click()
    await page.getByRole('button', { name: /^Conta X/ }).click()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    await expect.element(page.getByText('Lançamento registrado.')).toBeVisible()
    expect(recorded).toEqual([
      expect.objectContaining({
        entryType: 'settlement',
        amountCents: 12_000,
        contactId: MEMBER_C,
        receivedInAccountId: CHECKING,
        description: 'Member C pagou',
      }),
    ])
  })
})

describe('ENT-02 shortcuts', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('repeats a recent entry in one tap and undoes it', async () => {
    await openNewEntry()
    await page.getByRole('button', { name: /Mercado da semana/ }).click()

    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('86,40')
    await expect.element(page.getByLabelText(/^Descrição/)).toHaveValue('Mercado da semana')
    await expectText(page.getByRole('button', { name: /^Categoria/ }), /Mercado›Feira/)
    await expect.element(page.getByLabelText('Forma de pagamento')).toHaveTextContent('Pix')
    await expect
      .element(page.getByRole('button', { name: /Mercado da semana/ }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect.element(page.getByText('Igual à última vez. Confira o valor.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()

    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('')
    await expect.element(page.getByLabelText(/^Descrição/)).toHaveValue('')
  })

  it('fills the rest from a description suggestion and goes back to the amount', async () => {
    await openNewEntry()
    await page.getByLabelText(/^Descrição/).fill('Mer')
    await page.getByRole('option', { name: 'Mercado da semana' }).click()

    await expect.element(page.getByLabelText(/^Descrição/)).toHaveValue('Mercado da semana')
    await expect
      .element(page.getByText('Categoria, conta e forma de pagamento como da última vez.'))
      .toBeVisible()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveFocus()
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('')
  })

  it('has no recent row when the type has none', async () => {
    await openNewEntry()
    await expect.element(page.getByRole('heading', { name: 'Repetir um recente' })).toBeVisible()
    await page.getByRole('radio', { name: 'Receita' }).click()

    await expect
      .element(page.getByRole('heading', { name: 'Repetir um recente' }))
      .not.toBeInTheDocument()
  })
})

describe('ENT-02 and the planned bills', () => {
  const INTERNET_ID = '00000000-0000-4000-8000-0000000006a1'
  const LIGHT_ID = '00000000-0000-4000-8000-0000000006a2'

  function planned(id: string, description: string, overrides: Record<string, unknown> = {}) {
    return {
      id,
      ruleId: `rule-${id}`,
      description,
      entryType: 'expense',
      sourceAccountId: WALLET,
      categoryAccountId: MARKET,
      dueOn: '2026-10-18',
      amountCents: 12_000,
      amountIsEstimate: false,
      status: 'pending',
      matchedEntryId: null,
      skippedByUserId: null,
      frequency: 'monthly',
      interval: 1,
      isOverdue: true,
      paidOn: null,
      paidCents: null,
      ...overrides,
    }
  }

  function matchRecorder(calls: string[]): Record<string, FakeAnswer> {
    return Object.fromEntries(
      [INTERNET_ID, LIGHT_ID].map((id) => [
        `POST ${BASE}/occurrences/${id}/match`,
        async (request: Request) => {
          calls.push(`${id} ${await request.text()}`)
          return new Response(null, { status: 204 })
        },
      ]),
    )
  }

  it('fills the form from a planned bill and asks whether the entry pays it', async () => {
    const calls: string[] = []
    const { recorded } = await openNewEntry({
      search: `&entryOccurrence=${INTERNET_ID}`,
      answers: {
        [`GET ${BASE}/occurrences/${INTERNET_ID}`]: () =>
          Response.json(planned(INTERNET_ID, 'Internet')),
        ...matchRecorder(calls),
      },
    })
    await expect.element(page.getByLabelText(/^Descrição/)).toHaveValue('Internet')
    await expect.element(page.getByLabelText(/^Valor/)).toHaveValue('120,00')

    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    const question = page.getByRole('dialog', { name: 'Este lançamento paga Internet de 18/10?' })
    await expect.element(question).toBeVisible()
    await expect.element(question.getByText(/Prevista para 18\/10/)).toBeVisible()
    await expectNoAccessibilityViolations(question.element())
    await question.getByRole('button', { name: 'Sim, paga' }).click()
    await expect.element(page.getByText('Internet de 18/10 marcada como paga.')).toBeVisible()
    expect(calls).toEqual([`${INTERNET_ID} {"entryId":"entry-1"}`])
    expect(recorded).toEqual([
      expect.objectContaining({ description: 'Internet', amountCents: 12_000, categoryId: MARKET }),
    ])
  })

  it('asks after any entry when the API finds planned bills like it, the likeliest chosen', async () => {
    const calls: string[] = []
    await openNewEntry({
      answers: {
        [`GET ${BASE}/occurrences/suggestions`]: () =>
          Response.json([
            planned(LIGHT_ID, 'Luz', {
              dueOn: '2026-10-22',
              amountIsEstimate: true,
              isOverdue: false,
            }),
            planned(INTERNET_ID, 'Internet'),
          ]),
        ...matchRecorder(calls),
      },
    })
    await fillExpense()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()

    const question = page.getByRole('dialog', { name: 'Isto paga alguma conta prevista?' })
    await expect.element(question.getByRole('radio', { name: /Luz/ })).toBeChecked()
    await expect.element(question.getByText(/Atrasada desde 18\/10/)).toBeVisible()
    await question.getByRole('radio', { name: /Internet/ }).click()
    await question.getByRole('button', { name: 'Paga Internet' }).click()
    await expect.poll(() => calls).toEqual([`${INTERNET_ID} {"entryId":"entry-1"}`])
  })

  it('closes without asking when nothing planned looks like the entry', async () => {
    await openNewEntry()
    await fillExpense()
    await page.getByRole('button', { name: 'Salvar lançamento' }).click()
    await expect
      .element(page.getByRole('dialog', { name: 'Novo lançamento' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('dialog', { name: 'Isto paga alguma conta prevista?' }))
      .not.toBeInTheDocument()
  })
})
