import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, CHECKING, MEMBER_A, NEW_ACCOUNT } from '@web/testing/accounts-api'
import {
  accessAs,
  apiError,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

async function openAccounts({
  access = workspaceAccess,
  answers = {},
  path = '',
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
  path?: string
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...accountsAnswers(answers),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/accounts${path}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

describe('ACC-03 account form', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates an account with its owner, drawing and colour, and highlights it', async () => {
    const sent: unknown[] = []
    const app = await openAccounts({
      path: '?account=new',
      answers: {
        [`POST ${BASE}/accounts`]: async (request) => {
          sent.push(await request.json())
          return Response.json({ accountId: NEW_ACCOUNT }, { status: 201 })
        },
      },
    })
    const dialog = page.getByRole('dialog', { name: 'Nova conta' })
    await expect.element(dialog).toBeVisible()
    await expect.element(page.getByLabelText(/^Nome/)).toHaveFocus()
    await expect.element(page.getByRole('radio', { name: 'Conta corrente' })).toBeChecked()
    await expect.element(page.getByRole('radio', { name: 'Member A' })).toBeChecked()

    await page.getByLabelText(/^Nome/).fill('Conta Z')
    await page.getByRole('radio', { name: 'Poupança' }).click()
    await page.getByRole('radio', { name: 'Da casa' }).click()
    await page.getByRole('radio', { name: 'Cofrinho' }).click()
    await page.getByRole('radio', { name: 'Petróleo' }).click()
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect.element(page.getByText('Conta Z criada.')).toBeVisible()
    expect(sent).toEqual([
      {
        kind: 'savings',
        name: 'Conta Z',
        ownerUserId: null,
        icon: 'piggy-bank',
        color: ACCOUNT_COLORS[6].value,
      },
    ])
    await expect.poll(() => app.router.state.location.search).toEqual({ created: NEW_ACCOUNT })
  })

  it('edits only what changed and keeps the kind locked', async () => {
    const sent: unknown[] = []
    await openAccounts({
      path: `?account=${CHECKING}`,
      answers: {
        [`PATCH ${BASE}/accounts/${CHECKING}`]: async (request) => {
          sent.push(await request.json())
          return new Response(null, { status: 204 })
        },
      },
    })
    await expect.element(page.getByRole('dialog', { name: 'Editar conta' })).toBeVisible()
    await expect
      .element(page.getByRole('group', { name: 'Tipo' }).getByText('Conta corrente'))
      .toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Salvar' }))
      .toHaveAttribute('aria-disabled', 'true')

    await page.getByLabelText(/^Nome/).fill('Conta W')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect.element(page.getByText('Alterações salvas.')).toBeVisible()
    expect(sent).toEqual([{ name: 'Conta W' }])
  })

  it('puts a taken name under the field and keeps the button on', async () => {
    await openAccounts({
      path: '?account=new',
      answers: { [`POST ${BASE}/accounts`]: () => apiError('ACCOUNT_NAME_TAKEN', 409) },
    })
    await page.getByLabelText(/^Nome/).fill('Conta X')

    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect.element(page.getByText('Já existe uma conta com esse nome aqui.')).toBeVisible()
    await expect.element(page.getByLabelText(/^Nome/)).toHaveAttribute('aria-invalid', 'true')
    await expect
      .element(page.getByRole('button', { name: 'Criar conta' }))
      .not.toHaveAttribute('aria-disabled', 'true')
  })

  it('has no accessibility violations', async () => {
    await openAccounts({ path: '?account=new' })
    const dialog = page.getByRole('dialog', { name: 'Nova conta' })
    await expect.element(dialog).toBeVisible()

    await expectNoAccessibilityViolations(dialog.element())
  })

  it('does not open for a viewer', async () => {
    await openAccounts({
      path: '?account=new',
      access: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })

    await expect.element(page.getByText('Conta X')).toBeVisible()
    await expect.element(page.getByRole('dialog', { name: 'Nova conta' })).not.toBeInTheDocument()
  })
})
