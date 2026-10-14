import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, CARD, MEMBER_A, OPEN_INVOICE } from '@web/testing/accounts-api'
import { fakeApi, WORKSPACE_ID, workspaceAccess, workspaceList } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

async function openInvoices(search = '', answers: Record<string, FakeAnswer> = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: workspaceAccess,
    ...accountsAnswers(answers),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/cards/${CARD}${search}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

describe('CARD-02 invoices of a card', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('opens on the open invoice, named after the month it is due, with its first lines', async () => {
    await openInvoices()

    await expect.element(page.getByRole('heading', { name: 'Cartão X', level: 1 })).toBeVisible()
    await expect.element(page.getByRole('heading', { name: 'Fatura de novembro' })).toBeVisible()
    await expect.element(page.getByText('Fecha 25/10 · vence 04/11')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Fatura de nov de 2026, Aberta' }))
      .toHaveAttribute('aria-current', 'true')
    await expect.element(page.getByText('R$ 160,00 de terceiros')).toBeVisible()
    await expect.element(page.getByText('1/3')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Ver todos (3)' })).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('pays the chosen invoice through the new entry', async () => {
    const app = await openInvoices()
    await page.getByRole('link', { name: 'Pagar fatura' }).click()

    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({
        entry: 'new',
        entryType: 'invoice_payment',
        entryCard: CARD,
        entryInvoice: OPEN_INVOICE,
      })
  })

  it('has nothing to pay on a paid invoice', async () => {
    await openInvoices('?month=2026-10')

    await expect.element(page.getByText('Paga em 03/10 com a Conta X.')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Pagar fatura' })).not.toBeInTheDocument()
  })

  it('says when a future invoice opens', async () => {
    await openInvoices('?month=2026-12')

    await expect.element(page.getByRole('heading', { name: 'Fatura de dezembro' })).toBeVisible()
    await expect
      .element(
        page.getByText('Só parcelas até agora. Ela abre em 26/10, quando a de novembro fechar.'),
      )
      .toBeVisible()
  })

  it('says when and with which account a paid invoice was paid', async () => {
    await openInvoices('?month=2026-10')

    await expect.element(page.getByText('Paga em 03/10 com a Conta X.')).toBeVisible()
    await expect.element(page.getByText('Com a Conta X')).toBeVisible()
  })

  it('picks a month from the year sheet', async () => {
    const app = await openInvoices()

    await page.getByRole('button', { name: 'Todas' }).click()
    await expect.element(page.getByRole('heading', { name: '2026' })).toBeVisible()
    await page.getByRole('link', { name: /out/ }).last().click()

    await expect.element(page.getByRole('heading', { name: 'Fatura de outubro' })).toBeVisible()
    expect(app.router.state.location.search).toEqual({ month: '2026-10' })
  })

  it('says so when the card does not exist', async () => {
    await openInvoices('', { [`GET ${BASE}/cards`]: () => Response.json([]) })

    await expect.element(page.getByText('Cartão não encontrado.')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Voltar para Cartões' })).toBeVisible()
  })
})

describe('CARD-02 and CARD-03 on the desktop', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'))
    await page.viewport(1440, 900)
  })

  afterEach(async () => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('shows the chosen invoice as four numbers and its lines in one table, filtered in place', async () => {
    await openInvoices()

    await expect
      .element(
        page.getByRole('navigation', { name: 'Caminho' }).getByRole('link', { name: 'Cartões' }),
      )
      .toBeVisible()
    await expect
      .element(
        page.getByText(
          /Fecha dia 25 · vence dia 4 · Member B · limite de R\$\s6\.000,00 \(48% usado\)/,
        ),
      )
      .toBeVisible()
    await expect.element(page.getByRole('heading', { name: 'Total da fatura' })).toBeVisible()
    await expect.element(page.getByText('Pago até agora: R$ 0,00')).toBeVisible()
    const table = page.getByRole('table', { name: 'Lançamentos da fatura' })
    await expect.element(table.getByRole('cell', { name: '1/3', exact: true })).toBeVisible()
    await expect.element(table.getByRole('cell', { name: 'R$ 160,00', exact: true })).toBeVisible()

    await page.getByRole('radio', { name: 'Com terceiros' }).click()

    await expect
      .element(table.getByRole('cell', { name: '1/3', exact: true }))
      .not.toBeInTheDocument()
    await expect.element(table.getByRole('cell', { name: 'R$ 160,00', exact: true })).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})
