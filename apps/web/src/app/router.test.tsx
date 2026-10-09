import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { demoAnswers } from '@web/testing/demo-api'
import {
  account,
  apiError,
  fakeApi,
  sessionRequired,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const ME = '/api/auth/me'
const HEALTH = '/api/health/ready'
const WORKSPACES = '/api/workspaces'
const ACCESS = `/api/workspaces/${WORKSPACE_ID}`
const WORKSPACE_PATH = `/w/${WORKSPACE_ID}`
const LOGIN_TITLE = 'Entrar no Twise'

async function startAt(path: string) {
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  const screen = await render(<AppProviders app={app} />)
  return { app, screen }
}

function healthy(): Response {
  return Response.json({ status: 'ready', version: 'dev' })
}

const inTheWorkspace = {
  ...demoAnswers(),
  [ME]: account,
  [HEALTH]: healthy,
  [WORKSPACES]: () => workspaceList(),
  [ACCESS]: workspaceAccess,
}

describe('app router', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('sends a visitor without a session to log in, remembering where they were going', async () => {
    fakeApi({ [ME]: sessionRequired })
    const { app, screen } = await startAt('/')

    await expect.element(screen.getByRole('heading', { name: LOGIN_TITLE })).toBeVisible()
    expect(app.router.state.location.pathname).toBe('/login')
    expect(app.router.state.location.search).toEqual({ next: '/' })
  })

  it('opens the only workspace of someone with a session', async () => {
    fakeApi({ ...inTheWorkspace })
    const { app, screen } = await startAt('/')

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(app.router.state.location.pathname).toBe(WORKSPACE_PATH)
  })

  it('opens the workspace used last on this device among several', async () => {
    localStorage.setItem('lastWorkspaceId', WORKSPACE_ID)
    fakeApi({
      ...inTheWorkspace,
      [WORKSPACES]: () =>
        workspaceList([
          { workspaceId: 'other-workspace', name: 'Pessoal' },
          { workspaceId: WORKSPACE_ID, name: 'Casa' },
        ]),
    })
    const { app, screen } = await startAt('/')

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(app.router.state.location.pathname).toBe(WORKSPACE_PATH)
  })

  it('lets someone with several workspaces and none used here pick one', async () => {
    fakeApi({
      ...inTheWorkspace,
      [WORKSPACES]: () =>
        workspaceList([
          { workspaceId: 'workspace-1', name: 'Casa' },
          { workspaceId: 'workspace-2', name: 'Pessoal' },
        ]),
    })
    const { screen } = await startAt('/')

    await expect.element(screen.getByRole('heading', { name: 'Seus espaços' })).toBeVisible()
    await expect.element(screen.getByRole('link', { name: /Pessoal/ })).toBeVisible()
  })

  it('sends someone with no workspace to create the first one', async () => {
    fakeApi({ ...inTheWorkspace, [WORKSPACES]: () => workspaceList([]) })
    const { app, screen } = await startAt('/')

    await expect
      .element(screen.getByRole('heading', { name: 'Criar o espaço de vocês' }))
      .toBeVisible()
    expect(app.router.state.location.pathname).toBe('/workspaces/new')
  })

  it('says when the workspace is no longer theirs and lists the others', async () => {
    localStorage.setItem('lastWorkspaceId', WORKSPACE_ID)
    fakeApi({ ...inTheWorkspace, [ACCESS]: () => apiError('WORKSPACE_NOT_FOUND', 404) })
    const { app, screen } = await startAt(WORKSPACE_PATH)

    await expect.element(screen.getByText('Você não tem mais acesso a este espaço.')).toBeVisible()
    expect(app.router.state.location.search).toEqual({ lost: true })
  })

  it('sends someone already logged in from log in to where they were going', async () => {
    fakeApi({ ...inTheWorkspace })
    const { app, screen } = await startAt('/login?next=%2F')

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(app.router.state.location.pathname).toBe(WORKSPACE_PATH)
  })

  it('never follows a next address outside the app', async () => {
    fakeApi({ ...inTheWorkspace })
    const { app, screen } = await startAt('/login?next=%2F%2Fevil.test')

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(app.router.state.location.pathname).toBe(WORKSPACE_PATH)
  })

  it('returns to log in with the session-ended notice when the session ends', async () => {
    const api = fakeApi({ ...inTheWorkspace })
    const { app, screen } = await startAt('/')
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()

    api.mockImplementation(() => Promise.resolve(sessionRequired()))
    await app.queryClient.refetchQueries()

    await expect.element(screen.getByRole('heading', { name: LOGIN_TITLE })).toBeVisible()
    expect(app.router.state.location.search).toEqual({
      next: WORKSPACE_PATH,
      notice: 'session-ended',
    })
  })
  it('has no accessibility violations on log in', async () => {
    fakeApi({ [ME]: sessionRequired })
    const { screen } = await startAt('/login')

    await expect.element(screen.getByRole('heading', { name: LOGIN_TITLE })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
  it('says when the role lost a permission and reloads the permissions', async () => {
    const api = fakeApi({ ...inTheWorkspace })
    const { app, screen } = await startAt('/')
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()

    api.mockImplementation(() =>
      Promise.resolve(
        Response.json(
          { error: { code: 'PERMISSION_DENIED', message: 'No', ref: 'abcd1234' } },
          { status: 403 },
        ),
      ),
    )
    await app.queryClient.refetchQueries()

    await expect
      .element(
        screen.getByText('Você não tem permissão para isso. Peça a um administrador do espaço.'),
      )
      .toBeVisible()
  })
})
