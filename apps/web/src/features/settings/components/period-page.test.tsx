import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
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
import { periodPreviewAnswer, workspaceSettingsAnswer } from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const PERIOD_PATH = `/w/${WORKSPACE_ID}/settings/period`
const BAD_REQUEST = 400
const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'settings', action: 'view' }]

async function openPeriod({
  access = workspaceAccess,
  answers = {},
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...workspaceSettingsAnswer(),
    ...periodPreviewAnswer(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [PERIOD_PATH] }))
  await render(<AppProviders app={app} />)
  return app
}

function choice(name: string) {
  return page.getByRole('radiogroup', { name: 'Seu mês financeiro começa' }).getByRole('radio', {
    name,
  })
}

function preview() {
  return page.getByText(/^Período atual:/)
}

function saveButton() {
  return page.getByRole('button', { name: 'Salvar período' })
}

describe('SET-01 Mês financeiro', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows the saved start with the current and next period from the API', async () => {
    await openPeriod()
    await expect
      .element(page.getByRole('heading', { name: 'Mês financeiro', level: 1 }))
      .toBeVisible()
    await expect.element(page.getByText('Use o dia em que o salário costuma cair.')).toBeVisible()
    await expect
      .element(choice('No dia 1 (mês do calendário)'))
      .toHaveAttribute('aria-checked', 'true')
    await expect.element(preview()).toHaveTextContent('Período atual: 1 out – 31 out')
    await expect.element(page.getByText(/^O próximo vai de 1 nov a 30 nov\./)).toBeVisible()
    await expect.element(saveButton()).toBeDisabled()
    await expectNoAccessibilityViolations(document.body)
  })

  it('previews each start as it is picked and saves the chosen one', async () => {
    const sent: unknown[] = []
    await openPeriod({
      answers: {
        [`PATCH ${BASE}/settings`]: async (request) => {
          sent.push(await request.json())
          return Response.json({})
        },
      },
    })
    await userEvent.click(choice('No 5º dia útil'))
    await expect.element(preview()).toHaveTextContent('Período atual: 7 out – 6 nov')

    await userEvent.click(choice('Todo dia 5'))
    await expect.element(preview()).toHaveTextContent('Período atual: 5 out – 4 nov')
    await userEvent.click(saveButton())

    await expect.element(page.getByText('Configurações salvas.')).toBeVisible()
    expect(sent).toEqual([{ periodAnchor: 'day_of_month', periodAnchorValue: 5 }])
    await expect.element(saveButton()).toBeDisabled()
  })

  it('keeps the choice and says so on top when the save is refused', async () => {
    await openPeriod({
      answers: { [`PATCH ${BASE}/settings`]: () => apiError('SETTINGS_INVALID', BAD_REQUEST) },
    })
    await userEvent.click(choice('Todo dia 5'))
    await userEvent.click(saveButton())

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('Não foi possível salvar. Confira os valores.')
    await expect.element(choice('Todo dia 5')).toHaveAttribute('aria-checked', 'true')
  })

  it('shows a member the choice dimmed, the lock note and no save', async () => {
    await openPeriod({ access: () => accessAs('Membro', MEMBER_PERMISSIONS) })
    await expect
      .element(page.getByText('Só donos e admins mudam as configurações. Peça a um deles.'))
      .toBeVisible()
    await expect.element(choice('Todo dia 5')).toBeDisabled()
    await expect.element(preview()).toHaveTextContent('Período atual: 1 out – 31 out')
    expect(saveButton().query()).toBeNull()
  })
})
