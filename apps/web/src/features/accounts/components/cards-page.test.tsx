import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, MEMBER_A } from '@web/testing/accounts-api'
import {
  accessAs,
  fakeApi,
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

async function openCards({
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
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/cards`] }))
  await render(<AppProviders app={app} />)
  return app
}

describe('CARD-01 cards', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows each card with its cycle, open invoice, limit and best day to buy', async () => {
    await openCards()

    await expect.element(page.getByRole('heading', { name: 'Cartões', level: 1 })).toBeVisible()
    await expect.element(page.getByText('Fecha dia 25 · vence dia 4 · Member B')).toBeVisible()
    await expect.element(page.getByText('Fatura aberta')).toBeVisible()
    await expect.element(page.getByText('vence 04/11')).toBeVisible()
    await expect.element(page.getByText('48% usado')).toBeVisible()
    await expect
      .element(page.getByText('Em aberto no cartão: R$ 2.890,00, com as parcelas futuras'))
      .toBeVisible()
    await expect.element(page.getByText('dia 25')).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('opens the invoices from the actions', async () => {
    const app = await openCards()

    await page.getByRole('button', { name: 'Ações de Cartão X' }).click()
    await page.getByRole('link', { name: 'Ver faturas' }).click()

    await expect.element(page.getByRole('heading', { name: 'Fatura de novembro' })).toBeVisible()
    expect(app.router.state.location.pathname).toContain('/cards/')
  })

  it('offers one "Editar cartão" that opens the whole card form', async () => {
    const app = await openCards()

    await page.getByRole('button', { name: 'Ações de Cartão X' }).click()
    await expect.element(page.getByRole('link', { name: 'Editar ciclo' })).not.toBeInTheDocument()
    await expect.element(page.getByRole('link', { name: 'Renomear e cor' })).not.toBeInTheDocument()
    await page.getByRole('link', { name: 'Editar cartão' }).click()

    await expect.element(page.getByRole('dialog', { name: 'Editar cartão' })).toBeVisible()
    await expect.element(page.getByLabelText(/^Nome do cartão/)).toHaveFocus()
    expect(app.router.state.location.search).toMatchObject({ card: expect.any(String) })
  })

  it('gives a viewer no actions', async () => {
    await openCards({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Fatura aberta')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Cartão X' }))
      .not.toBeInTheDocument()
  })

  it('explains why to add a card when there is none', async () => {
    await openCards({ answers: { [`GET ${BASE}/cards`]: () => Response.json([]) } })

    await expect.element(page.getByText('Nenhum cartão cadastrado.')).toBeVisible()
  })
})

describe('CARD-01 cards on the desktop', () => {
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

  it('closes the row with the "Novo cartão" tile and lists the upcoming invoices of every card', async () => {
    await openCards()

    await expect
      .element(page.getByText('Faturas, limites e o melhor dia de comprar em cada cartão.'))
      .toBeVisible()
    await expect
      .element(page.getByRole('link', { name: /^Novo cartão Cadastre com os dias/ }))
      .toHaveAttribute('href', expect.stringContaining('card=new'))
    const upcoming = page.getByRole('table', { name: 'Próximas faturas' })
    await expect.element(upcoming.getByRole('columnheader', { name: 'Situação' })).toBeVisible()
    for (const text of ['Novembro', '25/10', '04/11', 'Aberta', 'R$ 1.950,00', 'Futura']) {
      await expect.element(upcoming.getByRole('cell', { name: text, exact: true })).toBeVisible()
    }
    await expect
      .element(upcoming.getByRole('link', { name: 'Cartão X' }).first())
      .toHaveAttribute('href', expect.stringContaining('month=2026-11'))
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})
