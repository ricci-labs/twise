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
import {
  chargeTextAnswer,
  holidaysAnswer,
  NO_PIX,
  periodPreviewAnswer,
  WORKSPACE_TEXT,
  workspaceSettingsAnswer,
} from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'settings', action: 'view' }]

async function openSettings(
  answers: Record<string, FakeAnswer> = {},
  access: FakeAnswer = workspaceAccess,
) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: access,
    ...holidaysAnswer(),
    ...workspaceSettingsAnswer(),
    ...periodPreviewAnswer(),
    ...chargeTextAnswer(),
    ...answers,
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

  it('lists the name and currency under Espaço and opens them', async () => {
    const app = await openSettings()
    const workspace = page.getByRole('region', { name: 'Espaço' })
    const name = workspace.getByRole('link', { name: /Nome e moeda/ })
    await expect.element(name.getByText('Casa · Real (R$)')).toBeVisible()
    expect(workspace.getByText(/Você pode ver/).query()).toBeNull()
    const period = workspace.getByRole('link', { name: /Mês financeiro/ })
    await expect
      .element(period.getByText('Dia 1 (mês do calendário) · Período atual: 1 out – 31 out'))
      .toBeVisible()
    const budget = workspace.getByRole('link', { name: /Orçamento/ })
    await expect
      .element(budget.getByText('Só a renda fixa · Parcelas na fatura em que caem'))
      .toBeVisible()
    const calendar = workspace.getByRole('link', { name: /Calendário e fuso/ })
    await expect
      .element(calendar.getByText('Semana começa no domingo · Brasília (GMT-3)'))
      .toBeVisible()
    await name.click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/settings/name`)
    await expect
      .element(page.getByRole('heading', { name: 'Nome e moeda', level: 1 }))
      .toBeVisible()
  })

  it('tells a member they can only look', async () => {
    await openSettings({}, () => accessAs('Membro', MEMBER_PERMISSIONS))
    await expect
      .element(page.getByText('Só donos e admins mudam as configurações. Você pode ver.'))
      .toBeVisible()
  })

  it('opens the holidays from the row', async () => {
    const app = await openSettings()
    await page.getByRole('link', { name: /Feriados/ }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/settings/holidays`)
    await expect.element(page.getByRole('heading', { name: 'Feriados', level: 1 })).toBeVisible()
  })

  it('lists the Pix under Recebimentos with who receives it and opens it', async () => {
    const app = await openSettings()
    const receiving = page.getByRole('region', { name: 'Recebimentos' })
    const pix = receiving.getByRole('link', { name: /Recebimento por Pix/ })
    await expect.element(pix.getByText('Chave cadastrada · MEMBER A')).toBeVisible()
    await pix.click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/settings/pix`)
    await expect
      .element(page.getByRole('heading', { name: 'Recebimento por Pix', level: 1 }))
      .toBeVisible()
  })

  it('says when the Pix is not configured', async () => {
    await openSettings(workspaceSettingsAnswer(NO_PIX))
    await expect
      .element(page.getByRole('link', { name: /Recebimento por Pix/ }).getByText('Não configurado'))
      .toBeVisible()
  })

  it('lists the charge text under Recebimentos and opens it', async () => {
    const app = await openSettings()
    const text = page
      .getByRole('region', { name: 'Recebimentos' })
      .getByRole('link', { name: /Mensagem das cobranças/ })
    await expect.element(text.getByText('Texto padrão')).toBeVisible()
    await text.click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/settings/charge-text`)
    await expect
      .element(page.getByRole('heading', { name: 'Mensagem das cobranças', level: 1 }))
      .toBeVisible()
  })

  it('says when the workspace wrote its own charge text', async () => {
    await openSettings(chargeTextAnswer(WORKSPACE_TEXT))
    await expect
      .element(
        page.getByRole('link', { name: /Mensagem das cobranças/ }).getByText('Texto do espaço'),
      )
      .toBeVisible()
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
