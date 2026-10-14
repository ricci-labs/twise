import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accountsAnswers,
  BAKERY,
  CATEGORIES,
  GROCERIES,
  HOUSE,
  MARKET,
  MEMBER_A,
} from '@web/testing/accounts-api'
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

async function openCategories({
  access = workspaceAccess,
  answers = {},
  search = '',
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
  search?: string
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...accountsAnswers({ [`GET ${BASE}/accounts`]: () => Response.json(CATEGORIES), ...answers }),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/categories${search}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

function recorder(calls: string[]): FakeAnswer {
  return (request) => {
    calls.push(
      `${request.method} ${new URL(request.url).pathname.replace(`${BASE}/accounts/`, '')}`,
    )
    return new Response(null, { status: 204 })
  }
}

describe('ACC-02 categories', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('lists the expense categories with their subcategories folded, and remembers the open ones', async () => {
    await openCategories()
    const toggle = page.getByRole('button', { name: 'Mostrar as subcategorias de Mercado' })
    await expect.element(toggle).toHaveTextContent('2 subcategorias')
    await expect.element(page.getByText('Salário')).not.toBeInTheDocument()

    await toggle.click()

    await expect
      .element(page.getByRole('button', { name: 'Feira, subcategoria de Mercado: ações' }))
      .toBeVisible()
    expect(JSON.parse(localStorage.getItem(`openCategories:${WORKSPACE_ID}`) ?? '[]')).toEqual([
      GROCERIES,
    ])
  })

  it('shows the income categories with their nature in words', async () => {
    await openCategories({ search: '?kind=income' })

    await expect.element(page.getByText('Salário')).toBeVisible()
    await expect.element(page.getByText('Fixa')).toBeVisible()
    await expect
      .element(page.getByText(/A renda fixa \(salário\) é a que o orçamento usa/))
      .toBeVisible()
  })

  it('has no accessibility violations', async () => {
    localStorage.setItem(`openCategories:${WORKSPACE_ID}`, JSON.stringify([GROCERIES]))
    await openCategories()
    await expect.element(page.getByText('Padaria')).toBeVisible()

    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('archives a category with its subcategories, children first, and undoes it', async () => {
    const calls: string[] = []
    const record = recorder(calls)
    await openCategories({
      answers: Object.fromEntries(
        [GROCERIES, MARKET, BAKERY].flatMap((id) => [
          [`POST ${BASE}/accounts/${id}/archive`, record],
          [`POST ${BASE}/accounts/${id}/unarchive`, record],
        ]),
      ),
    })

    await page.getByRole('button', { name: 'Ações de Mercado' }).click()
    await page.getByRole('button', { name: 'Arquivar' }).click()
    await expect.element(page.getByText('Mercado e 2 subcategorias arquivadas.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()

    await expect
      .poll(() => calls)
      .toEqual([
        `POST ${MARKET}/archive`,
        `POST ${BAKERY}/archive`,
        `POST ${GROCERIES}/archive`,
        `POST ${GROCERIES}/unarchive`,
        `POST ${MARKET}/unarchive`,
        `POST ${BAKERY}/unarchive`,
      ])
  })

  it('names the subcategories when the API refuses to delete their parent', async () => {
    await openCategories({
      answers: {
        [`DELETE ${BASE}/accounts/${GROCERIES}`]: () => apiError('ACCOUNT_CANNOT_BE_DELETED', 409),
      },
    })

    await page.getByRole('button', { name: 'Ações de Mercado' }).click()
    await page.getByRole('button', { name: 'Excluir' }).click()

    const dialog = page.getByRole('alertdialog', { name: 'Não dá para excluir Mercado' })
    await expect
      .element(
        dialog.getByText(
          /Mercado tem 2 subcategorias: Feira e Padaria\. Mova ou exclua as duas antes/,
        ),
      )
      .toBeVisible()
    await expect.element(dialog.getByRole('button', { name: 'Arquivar as 3' })).toBeVisible()
  })

  it('moves a subcategory under another category from its chip', async () => {
    localStorage.setItem(`openCategories:${WORKSPACE_ID}`, JSON.stringify([GROCERIES]))
    const moves: unknown[] = []
    await openCategories({
      answers: {
        [`PATCH ${BASE}/accounts/${MARKET}`]: async (request) => {
          moves.push(await request.json())
          return new Response(null, { status: 204 })
        },
      },
    })

    await page.getByRole('button', { name: 'Feira, subcategoria de Mercado: ações' }).click()
    await expect.element(page.getByText('Subcategoria de Mercado')).toBeVisible()
    await page.getByRole('button', { name: 'Mover para outra categoria' }).click()
    await page.getByRole('button', { name: /^Casa/ }).click()

    await expect.element(page.getByText('Feira agora está em Casa.')).toBeVisible()
    expect(moves).toEqual([{ parentId: HOUSE }])
  })

  it('shows the tree without actions to a viewer', async () => {
    localStorage.setItem(`openCategories:${WORKSPACE_ID}`, JSON.stringify([GROCERIES]))
    await openCategories({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Feira')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Mercado' }))
      .not.toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: /^Feira/ })).not.toBeInTheDocument()
  })
})
