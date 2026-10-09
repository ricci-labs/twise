import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  account,
  apiError,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { fieldLabelled } from '@web/testing/fields'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const TITLE = 'Criar o espaço de vocês'

async function openCreatePage() {
  const app = createApp(createMemoryHistory({ initialEntries: ['/workspaces/new'] }))
  const screen = await render(<AppProviders app={app} />)
  await expect.element(screen.getByRole('heading', { name: TITLE })).toBeVisible()
  return { app, screen, name: fieldLabelled('Nome do espaço') }
}

describe('WS-01 create a workspace', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('creates the workspace, remembers it and opens it', async () => {
    const created: unknown[] = []
    fakeApi({
      '/api/auth/me': account,
      'GET /api/workspaces': () => workspaceList([]),
      'POST /api/workspaces': async (request) => {
        created.push(await request.json())
        return Response.json({ workspaceId: WORKSPACE_ID }, { status: 201 })
      },
      [`/api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
      '/api/health/ready': () => Response.json({ status: 'ready', version: 'dev' }),
    })
    const { app, screen, name } = await openCreatePage()

    await name.fill('  Casa  ')
    await screen.getByRole('button', { name: 'Criar espaço' }).click()

    await expect.element(screen.getByText('Espaço criado.')).toBeVisible()
    expect(created).toEqual([{ name: 'Casa' }])
    expect(app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}`)
    expect(localStorage.getItem('lastWorkspaceId')).toBe(WORKSPACE_ID)
  })

  it('asks for a name before creating, with the catalog message', async () => {
    const api = fakeApi({ '/api/auth/me': account })
    const { screen, name } = await openCreatePage()

    await name.click()
    await userEvent.tab()

    await expect
      .element(screen.getByText('Informe o nome do espaço (até 80 caracteres).'))
      .toBeVisible()
    expect(api.mock.calls.some(([input]) => String(input).endsWith('/api/workspaces'))).toBe(false)
  })

  it('shows a refusal of the name under the field', async () => {
    fakeApi({
      '/api/auth/me': account,
      'POST /api/workspaces': () => apiError('WORKSPACE_NAME_INVALID', 400),
    })
    const { screen, name } = await openCreatePage()

    await name.fill('Casa')
    await screen.getByRole('button', { name: 'Criar espaço' }).click()

    await expect.element(name).toHaveAttribute('aria-invalid', 'true')
  })

  it('tells who is logged in, offers to leave and has no accessibility violations', async () => {
    fakeApi({ '/api/auth/me': account })
    const { screen } = await openCreatePage()

    await expect.element(screen.getByText(/Entrou como member\.a@exemplo\.com/)).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Sair' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
