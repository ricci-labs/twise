import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accessAs,
  account,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const HOME = `/w/${WORKSPACE_ID}`

async function openWorkspace(answers: Record<string, FakeAnswer> = {}, path = HOME) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/health/ready': () => Response.json({ status: 'ready', version: 'dev' }),
    'GET /api/workspaces': () =>
      workspaceList([
        { workspaceId: WORKSPACE_ID, name: 'Casa' },
        { workspaceId: '00000000-0000-4000-8000-0000000000bb', name: 'Pessoal' },
      ]),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  const screen = await render(<AppProviders app={app} />)
  return { app, screen }
}

describe('SHELL-01 workspace shell', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    localStorage.clear()
    await page.viewport(414, 896)
  })

  it('shows the owner the whole menu, the workspace and the account at the foot', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openWorkspace()
    const menu = screen.getByRole('navigation', { name: 'Menu principal' })

    await expect
      .element(menu.getByRole('link', { name: 'Início' }))
      .toHaveAttribute('aria-current', 'page')
    for (const name of ['Lançamentos', 'Membros', 'Configurações', 'Histórico', 'Lixeira']) {
      await expect.element(menu.getByRole('link', { name })).toBeVisible()
    }
    await expect.element(menu.getByRole('link', { name: 'Novo lançamento' })).toBeVisible()
    await expect.element(menu.getByText('Dono · 2 pessoas')).toBeVisible()
    await expect.element(menu.getByText('member.a@exemplo.com')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('collapses the sidebar with Ctrl + B and remembers it', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openWorkspace()
    await expect.element(screen.getByRole('button', { name: 'Recolher o menu' })).toBeVisible()

    await userEvent.keyboard('{Control>}b{/Control}')

    await expect.element(screen.getByRole('button', { name: 'Abrir o menu' })).toBeVisible()
    expect(localStorage.getItem('sidebarCollapsed')).toBe('true')
  })

  it('switches to another workspace from the sidebar foot', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openWorkspace()

    await screen.getByRole('button', { name: 'Trocar de espaço. Atual: Casa' }).click()

    await expect
      .element(screen.getByRole('menuitem', { name: /Casa/ }))
      .toHaveAttribute('aria-current')
    await expect.element(screen.getByRole('menuitem', { name: /Pessoal/ })).toBeVisible()
    await expect.element(screen.getByRole('menuitem', { name: 'Criar espaço' })).toBeVisible()
  })

  it('hides from a viewer what the role cannot open or change, and says so', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openWorkspace({
      [`GET /api/workspaces/${WORKSPACE_ID}`]: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })
    const menu = screen.getByRole('navigation', { name: 'Menu principal' })

    await expect.element(menu.getByRole('link', { name: 'Lançamentos' })).toBeVisible()
    for (const name of ['Membros', 'Configurações', 'Histórico', 'Lixeira', 'Novo lançamento']) {
      await expect.element(menu.getByRole('link', { name })).not.toBeInTheDocument()
    }
    await expect
      .element(screen.getByText('Você está vendo este espaço sem poder alterar nada.'))
      .toBeVisible()
    await expect.element(menu.getByText('Leitor · 2 pessoas')).toBeVisible()
  })

  it('puts the rest of the menu and the account under "Mais" on the phone', async () => {
    await page.viewport(390, 844)
    const { screen } = await openWorkspace()
    const tabs = screen.getByRole('navigation', { name: 'Navegação' })

    await expect
      .element(tabs.getByRole('link', { name: 'Início' }))
      .toHaveAttribute('aria-current', 'page')
    await tabs.getByRole('button', { name: 'Mais' }).click()

    const sheet = screen.getByRole('dialog', { name: 'Mais' })
    await expect.element(sheet.getByRole('link', { name: 'Contatos e cobranças' })).toBeVisible()
    await expect.element(sheet.getByRole('link', { name: 'Minha conta' })).toBeVisible()
    await expect.element(sheet.getByRole('button', { name: 'Sair' })).toBeVisible()
  })

  it('lets the phone switch workspaces from the name at the top', async () => {
    await page.viewport(390, 844)
    const { screen } = await openWorkspace()

    await screen.getByRole('button', { name: 'Trocar de espaço. Atual: Casa' }).click()

    const sheet = screen.getByRole('dialog', { name: 'Seus espaços' })
    await expect.element(sheet.getByRole('link', { name: /Pessoal/ })).toBeVisible()
    await expect.element(sheet.getByRole('link', { name: 'Criar espaço' })).toBeVisible()
  })

  it('opens an area not built yet on a calm page inside the shell', async () => {
    await page.viewport(1440, 900)
    const { screen } = await openWorkspace({}, `${HOME}/cards`)

    await expect.element(screen.getByRole('heading', { name: 'Em breve' })).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Cartões' }))
      .toHaveAttribute('aria-current', 'page')
  })
})
