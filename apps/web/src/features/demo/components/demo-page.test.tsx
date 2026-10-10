import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { fakeApi, sessionRequired } from '@web/testing/fake-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

async function openDemo(path = '/demo') {
  await page.viewport(1440, 900)
  const api = fakeApi({ 'GET /api/auth/me': sessionRequired })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  const screen = await render(<AppProviders app={app} />)
  await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
  return { app, screen, api }
}

function freeToSpend() {
  const heading = document.querySelector('[data-slot=kpi-label]')
  return heading?.closest('[data-slot=kpi-card]')?.textContent ?? ''
}

describe('demo page', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('shows the Home of the demo household without a session or the API', async () => {
    const { screen, api } = await openDemo()

    expect(freeToSpend()).toContain('R$ 2.340,00')
    await expect.element(screen.getByText('Demonstração')).toBeVisible()
    await expect.element(screen.getByRole('region', { name: 'Previsão de saldo' })).toBeVisible()
    expect(api.mock.calls.some(([input]) => String(input).includes('/api/workspaces'))).toBe(false)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('switches to the month that passed the plan', async () => {
    const { app, screen } = await openDemo()

    await screen.getByRole('button', { name: 'Passou do planejado' }).click()

    await expect.element(screen.getByText('Ver onde ajustar')).toBeVisible()
    expect(freeToSpend()).toContain('−R$ 380,00')
    expect(app.router.state.location.search).toEqual({ variant: 'overspent' })
  })

  it('browses the periods inside the demo, a closed one with its achievements', async () => {
    const { app, screen } = await openDemo()

    await screen.getByRole('link', { name: 'Período anterior' }).click()

    await expect
      .element(screen.getByRole('region', { name: 'Conquistas de setembro' }))
      .toBeVisible()
    expect(app.router.state.location.pathname).toBe('/demo')
    expect(app.router.state.location.search).toEqual({ period: '2026-09' })
  })

  it('stays on the demo when a link points to an area of the app', async () => {
    const { app, screen } = await openDemo()

    await screen.getByRole('link', { name: 'Ver cartões' }).click()

    await expect
      .element(screen.getByText('Na demonstração, só a Início está aberta.'))
      .toBeVisible()
    expect(app.router.state.location.pathname).toBe('/demo')
  })

  it('wears the real app shell: the menu, the workspace and an example account', async () => {
    const { app, screen } = await openDemo()
    const menu = screen.getByRole('navigation', { name: 'Menu principal' })

    await expect
      .element(menu.getByRole('link', { name: 'Início' }))
      .toHaveAttribute('aria-current', 'page')
    await expect.element(menu.getByText('Dono · 2 pessoas')).toBeVisible()
    await expect
      .element(menu.getByRole('button', { name: 'Conta de exemplo: Member A' }))
      .toBeVisible()

    await menu.getByRole('link', { name: 'Lançamentos' }).click()

    await expect
      .element(screen.getByText('Na demonstração, só a Início está aberta.'))
      .toBeVisible()
    expect(app.router.state.location.pathname).toBe('/demo')
  })

  it('keeps the bottom tab bar on the phone', async () => {
    const { screen } = await openDemo()
    await page.viewport(390, 844)

    const tabs = screen.getByRole('navigation', { name: 'Navegação' })
    await expect.element(tabs.getByRole('link', { name: 'Início' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: /Trocar de espaço/ })).toBeVisible()
  })
})
