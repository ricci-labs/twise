import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  account,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { holidaysAnswer } from '@web/testing/settings-api'
import { beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

async function openSettings() {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...holidaysAnswer(),
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/settings`] }))
  await render(<AppProviders app={app} />)
  return app
}

describe('Configurações', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('lists the holidays under Planejamento with how many and the next one', async () => {
    await openSettings()
    await expect
      .element(page.getByRole('heading', { name: 'Configurações', level: 1 }))
      .toBeVisible()
    const planning = page.getByRole('region', { name: 'Planejamento' })
    const holidays = planning.getByRole('link', { name: /Feriados/ })
    await expect.element(holidays.getByText('15 em 2026 · próximo: Finados, 02/11')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Mais' }))
      .toHaveAttribute('aria-current', 'page')
    await expect
      .element(page.getByRole('link', { name: 'Novo lançamento' }))
      .not.toBeInTheDocument()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('opens the holidays from the row', async () => {
    const app = await openSettings()
    await page.getByRole('link', { name: /Feriados/ }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/settings/holidays`)
    await expect.element(page.getByRole('heading', { name: 'Feriados', level: 1 })).toBeVisible()
  })

  it('marks Configurações in the desktop menu', async () => {
    await page.viewport(1440, 900)
    await openSettings()
    const menu = page.getByRole('navigation', { name: 'Menu principal' })
    await expect
      .element(menu.getByRole('link', { name: 'Configurações' }))
      .toHaveAttribute('aria-current', 'page')
  })
})
