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
import { workspaceSettingsAnswer } from '@web/testing/settings-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NAME_PATH = `/w/${WORKSPACE_ID}/settings/name`
const BAD_REQUEST = 400
const SERVER_ERROR = 500
const NO_CONTENT = 204
const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'settings', action: 'view' }]

async function openName({
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
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [NAME_PATH] }))
  await render(<AppProviders app={app} />)
  return app
}

function nameField() {
  return page.getByRole('textbox', { name: 'Nome do espaço' })
}

function saveButton() {
  return page.getByRole('button', { name: 'Salvar nome' })
}

describe('SET-01 Nome e moeda', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows the name to edit and the currency locked, with save waiting for a change', async () => {
    await openName()
    await expect
      .element(page.getByRole('heading', { name: 'Nome e moeda', level: 1 }))
      .toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Voltar para Configurações' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/settings`)
    await expect.element(nameField()).toHaveValue('Casa')
    await expect.element(page.getByText('Real (R$)')).toBeVisible()
    await expect.element(page.getByText('Não muda por enquanto.')).toBeVisible()
    await expect.element(saveButton()).toBeDisabled()
    expect(page.getByRole('navigation', { name: 'Navegação', exact: true }).query()).toBeNull()
    await expectNoAccessibilityViolations(document.body)
  })

  it('saves the new name and says so', async () => {
    const sent: unknown[] = []
    await openName({
      answers: {
        [`PATCH ${BASE}`]: async (request) => {
          sent.push(await request.json())
          return new Response(null, { status: NO_CONTENT })
        },
      },
    })
    await userEvent.fill(nameField(), 'Casa nova')
    await userEvent.click(saveButton())

    await expect.element(page.getByText('Configurações salvas.')).toBeVisible()
    expect(sent).toEqual([{ name: 'Casa nova' }])
    await expect.element(saveButton()).toBeDisabled()
  })

  it('puts a refused name under the field and other errors on top, keeping what was typed', async () => {
    let attempt = 0
    await openName({
      answers: {
        [`PATCH ${BASE}`]: () =>
          attempt++ === 0
            ? apiError('WORKSPACE_NAME_INVALID', BAD_REQUEST)
            : apiError('INTERNAL', SERVER_ERROR),
      },
    })
    await userEvent.fill(nameField(), 'Casa nova')
    await userEvent.click(saveButton())
    await expect
      .element(page.getByText('Informe o nome do espaço (até 80 caracteres).'))
      .toBeVisible()

    await userEvent.fill(nameField(), 'Casa de novo')
    await userEvent.click(saveButton())
    await expect.element(page.getByRole('alert')).toBeVisible()
    await expect.element(nameField()).toHaveValue('Casa de novo')
  })

  it('shows a member the same screen read only, with the lock note and no save', async () => {
    await openName({ access: () => accessAs('Membro', MEMBER_PERMISSIONS) })
    await expect
      .element(page.getByText('Só donos e admins mudam as configurações. Peça a um deles.'))
      .toBeVisible()
    await expect.element(nameField()).toHaveAttribute('readonly')
    expect(saveButton().query()).toBeNull()
  })
})
