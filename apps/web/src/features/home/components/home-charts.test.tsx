import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { demoAnswers } from '@web/testing/demo-api'
import {
  account,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const HOME = `/w/${WORKSPACE_ID}`

async function openHome(path = HOME) {
  await page.viewport(1440, 900)
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...demoAnswers(),
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  const screen = await render(<AppProviders app={app} />)
  await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
  return screen
}

describe('HOME-01 charts', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('forecasts each account until the next salary, switching with the tabs', async () => {
    const screen = await openHome()
    const forecast = screen.getByRole('region', { name: 'Previsão de saldo' })

    await expect
      .element(forecast.getByText('R$ 410,00 · 4 nov · menor saldo do período'))
      .toBeVisible()
    await expect
      .element(forecast.getByText(/Hoje R\$\s4\.200,00 · termina em R\$\s3\.910,00 em 05\/11/))
      .toBeVisible()
    await forecast.getByRole('button', { name: 'Conta Y' }).click()
    await expect.element(forecast.getByText(/Hoje R\$\s3\.100,00/)).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('compares the income used with the time gone', async () => {
    const screen = await openHome()
    const pace = screen.getByRole('region', { name: 'Ritmo do período' })

    await expect.element(pace.getByText('Vocês estão 22 pontos à frente do ritmo.')).toBeVisible()
    await expect.element(pace.getByRole('figure')).toHaveAccessibleName(/Renda já usada: 74%/)
  })

  it('lists the budgets most ahead of pace first, with their status', async () => {
    const screen = await openHome()
    const budgets = screen.getByRole('region', { name: 'Orçamentos' })
    const names = [...budgets.element().querySelectorAll('li > span:first-child')].map(
      (cell) => cell.textContent,
    )

    expect(names.slice(0, 2)).toEqual(['Lazer', 'Mercado'])
    await expect.element(budgets.getByText('R$ 460 de R$ 400')).toBeVisible()
    await expect.element(budgets.getByText('Estourou')).toBeVisible()
    await expect
      .element(budgets.getByText('Traço = onde o gasto deveria estar hoje (52% do período).'))
      .toBeVisible()
  })

  it('warns about the first month at 70% or more of the fixed income', async () => {
    const screen = await openHome()
    const months = screen.getByRole('region', { name: 'Próximos meses' })

    await expect
      .element(months.getByText('Janeiro já tem 72% da renda fixa comprometida.').first())
      .toBeVisible()
  })

  it('splits the budget income into spent, committed and free', async () => {
    const screen = await openHome()
    const split = screen.getByRole('region', { name: 'Para onde vai a renda' })

    await expect.element(split.getByText('26%')).toBeVisible()
    await expect
      .element(split.getByText('A comissão de R$ 1.500,00 fica fora desta conta.'))
      .toBeVisible()
  })

  it('tells how a closed period ended and leaves the forecast out', async () => {
    const screen = await openHome(`${HOME}?period=2026-09`)

    await expect
      .element(screen.getByRole('region', { name: 'Como o período terminou' }).getByText('95%'))
      .toBeVisible()
    await expect
      .element(screen.getByRole('region', { name: 'Previsão de saldo' }))
      .not.toBeInTheDocument()
  })
})
