import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accountsAnswers,
  MEMBER_A,
  TRASH,
  TRASHED_ACCOUNT,
  TRASHED_CHILD,
  TRASHED_PARENT,
} from '@web/testing/accounts-api'
import {
  apiError,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

async function openTrash(answers: Record<string, FakeAnswer> = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: workspaceAccess,
    ...accountsAnswers({ [`GET ${BASE}/accounts/trash`]: () => Response.json(TRASH), ...answers }),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/accounts/trash`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

function recordRestores(restored: string[]): Record<string, FakeAnswer> {
  return Object.fromEntries(
    [TRASHED_ACCOUNT, TRASHED_CHILD, TRASHED_PARENT].map((id) => [
      `POST ${BASE}/accounts/${id}/restore`,
      () => {
        restored.push(id)
        return new Response(null, { status: 204 })
      },
    ]),
  )
}

describe('ACC-04 accounts trash', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists what was deleted, newest first, with who, when, why and where it was', async () => {
    await openTrash()

    await expect.element(page.getByRole('heading', { name: 'Lixeira' })).toBeVisible()
    await expect.element(page.getByText('Excluída em 12/10/2026 por Member A')).toBeVisible()
    await expect.element(page.getByText('Motivo: conta encerrada no banco.')).toBeVisible()
    await expect.element(page.getByText('Categoria de despesa · Dentro de Saúde')).toBeVisible()
    await expect.element(page.getByText('Excluída em 01/10/2026', { exact: true })).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Voltar para Contas' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/accounts`)
  })

  it('has no accessibility violations', async () => {
    await openTrash()
    await expect.element(page.getByText('Conta antiga')).toBeVisible()

    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('restores an account and offers to see it', async () => {
    const restored: string[] = []
    const app = await openTrash(recordRestores(restored))

    await page.getByRole('button', { name: 'Restaurar Conta antiga' }).click()
    await expect.element(page.getByText('Conta restaurada.')).toBeVisible()
    await page.getByRole('button', { name: 'Ver' }).click()

    expect(restored).toEqual([TRASHED_ACCOUNT])
    await expect.poll(() => app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/accounts`)
  })

  it('names the parent in the trash and restores both, the parent first', async () => {
    const restored: string[] = []
    let refused = false
    await openTrash({
      ...recordRestores(restored),
      [`POST ${BASE}/accounts/${TRASHED_CHILD}/restore`]: () => {
        if (!refused) {
          refused = true
          return apiError('ACCOUNT_CANNOT_BE_RESTORED', 409)
        }
        restored.push(TRASHED_CHILD)
        return new Response(null, { status: 204 })
      },
    })

    await page.getByRole('button', { name: 'Restaurar Academia' }).click()
    await expect.element(page.getByText('Saúde, a categoria mãe, está na lixeira.')).toBeVisible()
    await page.getByRole('button', { name: 'Restaurar as duas' }).click()

    await expect.element(page.getByText('Categoria restaurada.')).toBeVisible()
    expect(restored).toEqual([TRASHED_PARENT, TRASHED_CHILD])
  })

  it('says when the trash is empty', async () => {
    await openTrash({ [`GET ${BASE}/accounts/trash`]: () => Response.json([]) })

    await expect.element(page.getByText('A lixeira está vazia.')).toBeVisible()
  })
})

describe('ACC-04 accounts trash on the desktop', () => {
  beforeEach(async () => {
    await page.viewport(1440, 900)
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('shows the path back to accounts above the title and the list in a card', async () => {
    await openTrash()

    await expect
      .element(
        page
          .getByRole('navigation', { name: 'Caminho' })
          .getByRole('link', { name: 'Contas e categorias' }),
      )
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/accounts`)
    await expect.element(page.getByRole('heading', { name: 'Lixeira', level: 1 })).toBeVisible()
    await expect.element(page.getByRole('link', { name: /^Voltar/ })).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})
