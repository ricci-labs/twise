import { demoOverview } from '@financas/shared'
import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { demoAnswers } from '@web/testing/demo-api'
import {
  account,
  fakeApi,
  OWNER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const HOME = `/w/${WORKSPACE_ID}`

async function openHome(path = HOME, answers: Record<string, FakeAnswer> = {}) {
  await page.viewport(1440, 900)
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...demoAnswers(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [path] }))
  return render(<AppProviders app={app} />)
}

describe('HOME-01 states', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    window.dispatchEvent(new Event('online'))
    await page.viewport(414, 896)
  })

  it('celebrates what went right in a closed period', async () => {
    const screen = await openHome(`${HOME}?period=2026-09`)
    const achievements = screen.getByRole('region', { name: 'Conquistas de setembro' })

    await expect.element(achievements.getByText('Fecharam setembro no azul')).toBeVisible()
    await expect.element(achievements.getByText('3º mês seguido')).toBeVisible()
    await expect.element(achievements.getByText('4 de 5')).toBeVisible()
    await expect.element(achievements.getByText('12 de 13')).toBeVisible()
    await expect.element(achievements.getByText('+R$ 600,00')).toBeVisible()
    await expect.element(achievements.getByText('30% → 40%')).toBeVisible()
    await expect.element(achievements.getByText('da meta Viagem')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('guides a new workspace through its first steps instead of empty numbers', async () => {
    const empty = demoOverview('current')
    const screen = await openHome(HOME, {
      [`GET /api/workspaces/${WORKSPACE_ID}/accounts`]: () => Response.json([]),
      [`GET /api/workspaces/${WORKSPACE_ID}/overview`]: () =>
        Response.json({
          ...empty,
          metrics: { ...empty.metrics, fixedIncome: 0, spent: 0 },
          insights: [],
        }),
    })

    await expect
      .element(screen.getByRole('heading', { name: 'Vamos montar o mês de vocês' }))
      .toBeVisible()
    await expect.element(screen.getByText('Bem-vindos ao Casa')).toBeVisible()
    await expect.element(screen.getByText('0 de 4 feitos')).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Começar pelas contas' }))
      .toHaveAttribute('href', `${HOME}/accounts`)
    await expect.element(screen.getByText('Próximo passo')).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: /Cadastre seus cartões/ }))
      .toHaveAttribute('href', `${HOME}/cards`)
    await expect.element(screen.getByText('Depois dos passos 1 e 3')).toBeVisible()
    await expect.element(screen.getByText('Convide quem divide com você')).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('asks the only member to invite the other person', async () => {
    const empty = demoOverview('current')
    const screen = await openHome(HOME, {
      [`GET /api/workspaces/${WORKSPACE_ID}`]: () =>
        Response.json({
          workspace: { workspaceId: WORKSPACE_ID, name: 'Casa', isArchived: false },
          membershipId: 'membership-a',
          role: { roleId: 'role-owner', name: 'Dono', systemKey: 'owner' },
          permissions: OWNER_PERMISSIONS,
          memberNames: ['Member A'],
        }),
      [`GET /api/workspaces/${WORKSPACE_ID}/accounts`]: () => Response.json([]),
      [`GET /api/workspaces/${WORKSPACE_ID}/overview`]: () =>
        Response.json({
          ...empty,
          metrics: { ...empty.metrics, fixedIncome: 0, spent: 0 },
          insights: [],
        }),
    })

    await expect.element(screen.getByText('Convide quem divide com você')).toBeVisible()
    await expect.element(screen.getByRole('link', { name: 'Convidar' })).toBeVisible()
    await expect.element(screen.getByText('Dono · só você')).toBeVisible()
  })

  it('keeps the last numbers offline and says when they were fetched', async () => {
    const screen = await openHome()
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    window.dispatchEvent(new Event('offline'))

    const banner = screen.getByRole('status').filter({ hasText: 'Sem conexão' })
    await expect.element(banner).toBeVisible()
    expect(banner.element().textContent).toMatch(
      /^Sem conexão\. Você pode ver seus dados, mas não salvar\.Atualizado às \d{2}:\d{2}$/,
    )
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()

    await screen.getByRole('link', { name: 'Novo lançamento' }).first().click()

    await expect
      .element(screen.getByText('Sem conexão. Dá para salvar quando a internet voltar.'))
      .toBeVisible()
    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
  })
})
