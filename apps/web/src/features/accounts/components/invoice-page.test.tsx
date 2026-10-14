import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accountsAnswers,
  CARD,
  MEMBER_A,
  OPEN_INVOICE,
  PAID_INVOICE,
} from '@web/testing/accounts-api'
import { fakeApi, WORKSPACE_ID, workspaceAccess, workspaceList } from '@web/testing/fake-api'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

async function openInvoice(invoiceId: string) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: workspaceAccess,
    ...accountsAnswers(),
  })
  const app = createApp(
    createMemoryHistory({
      initialEntries: [`/w/${WORKSPACE_ID}/cards/${CARD}/invoices/${invoiceId}`],
    }),
  )
  await render(<AppProviders app={app} />)
}

describe('CARD-03 invoice detail', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('sums the invoice up and filters the lines on the device', async () => {
    await openInvoice(OPEN_INVOICE)

    await expect.element(page.getByRole('heading', { name: 'Fatura de novembro' })).toBeVisible()
    await expect.element(page.getByText('Cartão X · fecha 25/10 · vence 04/11')).toBeVisible()
    await expect.element(page.getByText('R$ 1.710,00')).toBeVisible()
    await expect.element(page.getByText('Mercado da semana')).toBeVisible()

    await page.getByRole('radio', { name: 'Com terceiros' }).click()

    await expect.element(page.getByText('Jantar de aniversário')).toBeVisible()
    await expect.element(page.getByText('Mercado da semana')).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('warns that a closed invoice no longer changes and lists its payment', async () => {
    await openInvoice(PAID_INVOICE)

    await expect
      .element(
        page.getByText('Fatura fechada. Lançamentos dela não podem ser excluídos nem editados.'),
      )
      .toBeVisible()
    await expect.element(page.getByText('Pagamento')).toBeVisible()
    await expect.element(page.getByText('Com a Conta X')).toBeVisible()
  })

  it('says so when the invoice does not exist', async () => {
    await openInvoice('00000000-0000-4000-8000-0000000000ff')

    await expect.element(page.getByText('Fatura não encontrada.')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Voltar para as faturas' })).toBeVisible()
  })
})
