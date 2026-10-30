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
const BUDGET_PATH = `/w/${WORKSPACE_ID}/settings/budget`
const BAD_REQUEST = 400
const MEMBER_PERMISSIONS = [...VIEWER_PERMISSIONS, { module: 'settings', action: 'view' }]

async function openBudget({
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
  const app = createApp(createMemoryHistory({ initialEntries: [BUDGET_PATH] }))
  await render(<AppProviders app={app} />)
  return app
}

function choice(group: string, name: RegExp) {
  return page.getByRole('radiogroup', { name: group }).getByRole('radio', { name })
}

function saveButton() {
  return page.getByRole('button', { name: 'Salvar orçamento' })
}

const BASE_GROUP = 'O orçamento considera'
const VIEW_GROUP = 'Compras parceladas contam'

describe('SET-01 Orçamento', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows both questions with the saved answers and the recommended ones marked in text', async () => {
    await openBudget()
    await expect.element(page.getByRole('heading', { name: 'Orçamento', level: 1 })).toBeVisible()
    await expect
      .element(
        page.getByText(
          'Comissões variam; contar com elas no orçamento pode deixar o mês apertado.',
        ),
      )
      .toBeVisible()
    await expect
      .element(choice(BASE_GROUP, /Só a renda fixa/))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(choice(VIEW_GROUP, /Em cada parcela, na fatura em que ela cai/))
      .toHaveAttribute('aria-checked', 'true')
    expect(page.getByText('recomendado', { exact: true }).elements()).toHaveLength(2)
    await expect.element(saveButton()).toBeDisabled()
    await expectNoAccessibilityViolations(document.body)
  })

  it('saves both answers together', async () => {
    const sent: unknown[] = []
    await openBudget({
      answers: {
        [`PATCH ${BASE}/settings`]: async (request) => {
          sent.push(await request.json())
          return Response.json({})
        },
      },
    })
    await userEvent.click(choice(BASE_GROUP, /Toda a renda, incluindo comissões/))
    await userEvent.click(choice(VIEW_GROUP, /Inteiras, no mês da compra/))
    await userEvent.click(saveButton())

    await expect.element(page.getByText('Configurações salvas.')).toBeVisible()
    expect(sent).toEqual([{ budgetBase: 'all_income', installmentBudgetView: 'purchase_month' }])
  })

  it('keeps the answers and says so on top when the save is refused', async () => {
    await openBudget({
      answers: { [`PATCH ${BASE}/settings`]: () => apiError('SETTINGS_INVALID', BAD_REQUEST) },
    })
    await userEvent.click(choice(BASE_GROUP, /Toda a renda, incluindo comissões/))
    await userEvent.click(saveButton())

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('Não foi possível salvar. Confira os valores.')
    await expect
      .element(choice(BASE_GROUP, /Toda a renda, incluindo comissões/))
      .toHaveAttribute('aria-checked', 'true')
  })

  it('shows a member the answers disabled, the lock note and no save', async () => {
    await openBudget({ access: () => accessAs('Membro', MEMBER_PERMISSIONS) })
    await expect
      .element(page.getByText('Só donos e admins mudam as configurações. Peça a um deles.'))
      .toBeVisible()
    await expect.element(choice(BASE_GROUP, /Toda a renda, incluindo comissões/)).toBeDisabled()
    expect(saveButton().query()).toBeNull()
  })
})
