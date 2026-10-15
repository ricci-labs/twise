import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accountsAnswers,
  CARD,
  CHECKING,
  FUTURE_INVOICE,
  GROCERIES,
  MEMBER_A,
  OPEN_INVOICE,
  PAID_INVOICE,
  SAVINGS,
} from '@web/testing/accounts-api'
import { entriesListAnswers, listedEntry } from '@web/testing/entries-api'
import {
  accessAs,
  apiError,
  fakeApi,
  MEMBER_A_ID,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const ENTRY_ID = '00000000-0000-4000-8000-000000000301'
const CONTACT_C = '00000000-0000-4000-8000-0000000000d1'

const INSTALLMENTS = listedEntry(
  ENTRY_ID,
  '2026-09-20',
  'Geladeira',
  'card_purchase',
  [
    [GROCERIES, 300000],
    [CARD, -100000, { invoiceId: PAID_INVOICE, installmentNo: 1 }],
    [CARD, -100000, { invoiceId: OPEN_INVOICE, installmentNo: 2 }],
    [CARD, -100000, { invoiceId: FUTURE_INVOICE, installmentNo: 3 }],
  ],
  { installmentCount: 3, paymentMethod: 'credit', notes: 'Para a cozinha nova.' },
)

const DINNER = {
  ...listedEntry(ENTRY_ID, '2026-10-19', 'Jantar de aniversário', 'card_purchase', [
    [GROCERIES, 16000],
    ['receivable', 8000, { contactId: CONTACT_C }],
    [CARD, -24000, { invoiceId: OPEN_INVOICE, installmentNo: 1 }],
  ]),
  shares: [{ contactId: CONTACT_C, amountCents: 8000 }],
  ownCents: 16000,
}

const TRANSFER = listedEntry(
  ENTRY_ID,
  '2026-10-10',
  'Reserva de emergência',
  'transfer',
  [
    [CHECKING, -60000],
    [SAVINGS, 60000],
  ],
  { spentByUserId: null, paymentMethod: 'pix' },
)

async function openDetail(
  entry: unknown,
  { access = workspaceAccess, answers = {} as Record<string, FakeAnswer> } = {},
) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...accountsAnswers(),
    ...entriesListAnswers(),
    [`GET ${BASE}/entries/${ENTRY_ID}`]: () => Response.json(entry),
    [`GET ${BASE}/contacts`]: () =>
      Response.json([
        {
          id: CONTACT_C,
          name: 'Member C',
          phoneE164: null,
          pixKey: null,
          notes: null,
          isOptedOut: false,
          isArchived: false,
        },
      ]),
    [`GET ${BASE}/occurrences/matched`]: () => Response.json(null),
    ...answers,
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/entries/${ENTRY_ID}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

describe('ENT-03 entry detail', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a purchase in installments with its invoices and the closed-invoice note', async () => {
    const app = await openDetail(INSTALLMENTS)

    await expect.element(page.getByRole('heading', { name: 'Geladeira' })).toBeVisible()
    await expect
      .element(page.getByText(/^Parte deste lançamento está em uma fatura fechada/))
      .toBeVisible()
    const installments = page.getByRole('region', { name: 'Parcelas' })
    await expect.element(installments.getByText('1/3')).toBeVisible()
    await expect.element(installments.getByText('Paga')).toBeVisible()
    await expect.element(installments.getByText('Aberta')).toBeVisible()
    await expect.element(page.getByText('Para a cozinha nova.')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Histórico deste lançamento' }))
      .toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())

    await installments.getByRole('link', { name: /2\/3/ }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/cards/${CARD}/invoices/${OPEN_INVOICE}`)
  })

  it('shows what each contact owes and the own part, with the invoice of a purchase in one go', async () => {
    await openDetail(DINNER)

    const shares = page.getByRole('region', { name: 'Dividido com contatos' })
    await expect.element(shares.getByText(/Member C/)).toBeVisible()
    await expect.element(shares.getByText('Sua parte')).toBeVisible()
    await expect.element(shares.getByRole('link', { name: 'Ver cobranças' })).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'novembro, vence 04/11' })).toBeVisible()
    await expect.element(page.getByText(/^Parte deste lançamento/)).not.toBeInTheDocument()
  })

  it('draws a transfer from one account to the other, and the bill it paid', async () => {
    await openDetail(TRANSFER, {
      answers: {
        [`GET ${BASE}/occurrences/matched`]: () =>
          Response.json({ description: 'Aluguel', dueOn: '2026-10-10' }),
      },
    })

    const flow = page.getByRole('region', { name: 'De onde para onde' })
    await expect.element(flow.getByText('Saiu de')).toBeVisible()
    await expect.element(flow.getByText('Poupança')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Pagou a conta prevista Aluguel de outubro' }))
      .toBeVisible()
    await expect.element(page.getByText('Member A, pela web')).toBeVisible()
  })

  it('says the entry is gone and leads back to the list', async () => {
    const app = await openDetail(null, {
      answers: { [`GET ${BASE}/entries/${ENTRY_ID}`]: () => apiError('ENTRY_NOT_FOUND', 404) },
    })

    await expect.element(page.getByText('Este lançamento foi excluído ou editado.')).toBeVisible()
    await page.getByRole('link', { name: 'Voltar para Lançamentos' }).last().click()
    await expect.poll(() => app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/entries`)
  })

  it('shows a viewer the entry to read, without attaching or the history', async () => {
    await openDetail(TRANSFER, { access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByRole('heading', { name: 'Reserva de emergência' })).toBeVisible()
    await expect.element(page.getByText('Nenhum comprovante.')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: /Anexar comprovante/ }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('link', { name: 'Histórico deste lançamento' }))
      .not.toBeInTheDocument()
    expect(MEMBER_A_ID).toBe(MEMBER_A)
  })
})
