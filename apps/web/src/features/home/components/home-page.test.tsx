import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { demoAnswers } from '@web/testing/demo-api'
import {
  accessAs,
  account,
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

const HOME = `/w/${WORKSPACE_ID}`

async function openHome(answers: Record<string, FakeAnswer> = {}, path = HOME) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...demoAnswers(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  const screen = await render(<AppProviders app={app} />)
  return { app, screen }
}

function kpi(screen: Awaited<ReturnType<typeof openHome>>['screen'], label: string) {
  const heading = screen.getByRole('heading', { name: label, exact: true }).element()
  return heading.closest('[data-slot=kpi-card]')?.textContent ?? ''
}

describe('HOME-01 period overview', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    localStorage.clear()
    await page.viewport(414, 896)
  })

  it('shows the four indicators of the period with the design numbers', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openHome()
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()

    await expect.element(screen.getByText(/faltam 16 dias para o fim do período/)).toBeVisible()
    expect(kpi(screen, 'Livre para gastar')).toContain('R$ 2.340,00')
    expect(kpi(screen, 'Livre para gastar')).toContain('R$\u00a0146,25 por dia')
    expect(kpi(screen, 'Livre para gastar')).toContain('Até 4 nov · faltam 16 dias')
    expect(kpi(screen, 'Renda do orçamento')).toContain('Comissão à parte: R$\u00a01.500,00')
    expect(kpi(screen, 'Gasto')).toContain('43% da renda')
    expect(kpi(screen, 'Gasto')).toContain('Média mensal (3 meses): R$\u00a06.300,00')
    expect(kpi(screen, 'Comprometido')).toContain('3 contas vencem nos próximos 7 dias')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('tells the alerts in words with the names of categories, accounts and contacts', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openHome()
    const alerts = screen.getByRole('region', { name: 'Avisos' })

    await expect.element(alerts.getByText(/Lazer\s*estourou o orçamento/)).toBeVisible()
    await expect.element(alerts.getByText(/Internet\s*venceu em 18\/10\/2026/)).toBeVisible()
    await alerts.getByRole('button', { name: 'Ver todos os 6 avisos' }).click()
    await expect
      .element(alerts.getByText(/Janeiro\s*já tem 72% da renda fixa comprometida/))
      .toBeVisible()
    await expect.element(alerts.getByText(/Member D\s*está com/)).toBeVisible()
  })

  it('lists the bills of the next seven days, the late one first with "Registrar"', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openHome()
    const bills = screen.getByRole('region', { name: 'Vencem nos próximos 7 dias' })

    await expect
      .element(bills.getByText('3 contas · R$\u00a0820,00 até 26/10, e 1 atrasada.'))
      .toBeVisible()
    await expect.element(bills.getByText('Atrasada há 2 dias')).toBeVisible()
    await expect.element(bills.getByText('Quinta · em 2 dias')).toBeVisible()
    await expect.element(bills.getByRole('link', { name: 'Registrar' }).last()).toBeVisible()
  })

  it('hides the write actions from a viewer', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openHome({
      [`GET /api/workspaces/${WORKSPACE_ID}`]: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })
    await expect.element(screen.getByText('Atrasada há 2 dias')).toBeVisible()

    await expect.element(screen.getByRole('link', { name: 'Registrar' })).not.toBeInTheDocument()
    await expect.element(screen.getByRole('link', { name: 'Ver orçamento' }).first()).toBeVisible()
  })

  it('shows the plan passed in red, with the reason and where to adjust', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openHome(demoAnswers('overspent'))
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()

    expect(kpi(screen, 'Livre para gastar')).toContain('−R$ 380,00')
    expect(kpi(screen, 'Livre para gastar')).toContain('Passou do planejado')
    await expect.element(screen.getByRole('link', { name: 'Ver onde ajustar' })).toBeVisible()
  })

  it('sums up a closed period: what was left, nothing pending, no "Posso comprar?"', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openHome({}, `${HOME}?period=2026-09`)
    await expect.element(screen.getByText('Período encerrado')).toBeVisible()

    expect(kpi(screen, 'Livre para gastar')).toContain('Sobrou no período encerrado')
    expect(kpi(screen, 'Comprometido')).toContain('Nada ficou para vencer')
    await expect.element(screen.getByText('Posso comprar?')).not.toBeInTheDocument()
    await expect
      .element(screen.getByRole('link', { name: 'Ir para o período atual' }))
      .toBeVisible()
  })

  it('moves to the next period through the address', async () => {
    await page.viewport(1440, 900)
    const { app, screen } = await openHome()
    await expect.element(screen.getByText('out/26')).toBeVisible()

    await screen.getByRole('link', { name: 'Próximo período' }).click()

    await expect.element(screen.getByText('nov/26')).toBeVisible()
    expect(app.router.state.location.search).toEqual({ period: '2026-11' })
    await expect.element(screen.getByText('Período futuro')).toBeVisible()
  })

  it('says the overview failed, with its code, and tries again', async () => {
    const answers = demoAnswers()
    const overviewPath = `GET /api/workspaces/${WORKSPACE_ID}/overview`
    let isDown = true
    const { screen } = await openHome({
      [overviewPath]: (request) =>
        isDown
          ? apiError('INTERNAL_ERROR', 500)
          : (answers[overviewPath]?.(request) ?? apiError('X', 500)),
    })

    await expect.element(screen.getByText('Código: abcd1234'), { timeout: 10_000 }).toBeVisible()
    isDown = false
    await screen.getByRole('button', { name: 'Tentar de novo' }).click()

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
  })
})
