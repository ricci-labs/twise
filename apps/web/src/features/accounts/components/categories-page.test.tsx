import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  accountsAnswers,
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('offers a new subcategory on the line of a category that has none, keeping the row compact', async () => {
    await openCategories()

    await expect
      .element(page.getByRole('link', { name: 'Nova subcategoria em Casa' }))
      .toHaveTextContent('Subcategoria')
    await expect
      .element(page.getByRole('link', { name: 'Nova subcategoria em Mercado' }))
      .not.toBeInTheDocument()
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

  it('archives a category, which takes its subcategories along, and undoes it', async () => {
    const calls: string[] = []
    const record = recorder(calls)
    await openCategories({
      answers: {
        [`POST ${BASE}/accounts/${GROCERIES}/archive`]: record,
        [`POST ${BASE}/accounts/${GROCERIES}/unarchive`]: record,
      },
    })

    await page.getByRole('button', { name: 'Ações de Mercado' }).click()
    await page.getByRole('button', { name: 'Arquivar' }).click()
    await expect.element(page.getByText('Mercado e 2 subcategorias arquivadas.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()

    await expect
      .poll(() => calls)
      .toEqual([`POST ${GROCERIES}/archive`, `POST ${GROCERIES}/unarchive`])
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

  it('searches the categories once there are more than 12, opening the parent of a match', async () => {
    await openCategories({
      answers: {
        [`GET ${BASE}/accounts`]: () => Response.json([...CATEGORIES, ...HOUSE_CHILDREN]),
      },
    })
    const search = page.getByRole('searchbox', { name: 'Buscar categoria' })

    await search.fill('iptu')
    await expect
      .element(page.getByRole('button', { name: 'IPTU, subcategoria de Casa: ações' }))
      .toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Mercado' }))
      .not.toBeInTheDocument()
    await search.fill('xyz')
    await expect.element(page.getByText('Nenhuma categoria com esse nome.')).toBeVisible()
  })

  it('has no search while the categories are few', async () => {
    await openCategories()

    await expect.element(page.getByRole('button', { name: 'Ações de Mercado' })).toBeVisible()
    await expect.element(page.getByRole('searchbox')).not.toBeInTheDocument()
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

const HOUSE_CHILDREN = [
  'Aluguel',
  'Condomínio',
  'Luz e água',
  'Internet',
  'Gás',
  'IPTU',
  'Manutenção',
  'Limpeza',
  'Móveis',
  'Decoração',
  'Jardim',
  'Seguro residencial',
].map((name, position) => ({
  ...CATEGORIES[1],
  id: `00000000-0000-4000-8000-0000000001${String(position).padStart(2, '0')}`,
  name,
  parentId: HOUSE,
}))

describe('ACC-02 categories on the desktop', () => {
  beforeEach(async () => {
    await page.viewport(1440, 900)
  })

  afterEach(async () => {
    localStorage.clear()
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('lays expenses and incomes out as tables, with every subcategory in its row', async () => {
    await openCategories()

    const expenses = page.getByRole('table', { name: 'Despesas' })
    await expect.element(expenses).toBeVisible()
    await expect.element(page.getByText('2 categorias, 2 subcategorias.')).toBeVisible()
    await expect
      .element(expenses.getByRole('button', { name: 'Feira, subcategoria de Mercado: ações' }))
      .toBeVisible()
    await expect
      .element(expenses.getByRole('link', { name: 'Nova subcategoria em Casa' }))
      .toHaveTextContent('Subcategoria')
    const incomes = page.getByRole('table', { name: 'Receitas' })
    await expect.element(incomes.getByRole('columnheader', { name: 'Natureza' })).toBeVisible()
    await expect.element(incomes.getByText('Fixa')).toBeVisible()
    await expect.element(page.getByRole('radio', { name: 'Despesas' })).not.toBeInTheDocument()
    await expect
      .element(page.getByRole('link', { name: 'Nova categoria' }))
      .toHaveAttribute('href', expect.stringContaining('category=new'))
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('keeps many subcategories on one line behind "+N mais" and opens them in place', async () => {
    await openCategories({
      answers: {
        [`GET ${BASE}/accounts`]: () => Response.json([...CATEGORIES, ...HOUSE_CHILDREN]),
      },
    })

    const more = page.getByRole('button', { name: /^\+\d+ mais$/ })
    await expect.element(more).toBeVisible()
    await expect.element(page.getByText('12 subcategorias')).toBeVisible()
    const lastChip = page.getByRole('button', { name: /^Seguro residencial, subcategoria/ })
    await expect.element(lastChip).not.toBeInTheDocument()

    await more.click()

    await expect.element(lastChip).toBeVisible()
    await page.getByRole('button', { name: 'Mostrar menos' }).click()
    await expect.element(lastChip).not.toBeInTheDocument()
  })

  it('opens the actions of a subcategory in a menu under its chip', async () => {
    await openCategories()

    await page.getByRole('button', { name: 'Feira, subcategoria de Mercado: ações' }).click()

    await expect
      .element(page.getByRole('menuitem', { name: 'Mover para outra categoria' }))
      .toBeVisible()
  })
})
