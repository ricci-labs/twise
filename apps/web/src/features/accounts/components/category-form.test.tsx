import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, CATEGORIES, GROCERIES, MARKET, MEMBER_A } from '@web/testing/accounts-api'
import { fakeApi, WORKSPACE_ID, workspaceAccess, workspaceList } from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const CREATED = '00000000-0000-4000-8000-0000000000e9'

async function openCategories(search: string, answers: Record<string, FakeAnswer> = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: workspaceAccess,
    ...accountsAnswers({ [`GET ${BASE}/accounts`]: () => Response.json(CATEGORIES), ...answers }),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/categories${search}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

function recordJson(sent: unknown[], response: () => Response): FakeAnswer {
  return async (request) => {
    sent.push(await request.json())
    return response()
  }
}

describe('ACC-03 category form', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('creates a subcategory from its parent, with the parent drawing, and opens the parent', async () => {
    const sent: unknown[] = []
    const listed: unknown[] = [...CATEGORIES]
    const app = await openCategories('', {
      [`GET ${BASE}/accounts`]: () => Response.json(listed),
      [`POST ${BASE}/accounts`]: recordJson(sent, () => {
        listed.push({ ...CATEGORIES[1], id: CREATED, name: 'Hortifrúti' })
        return Response.json({ accountId: CREATED }, { status: 201 })
      }),
    })
    await page.getByRole('button', { name: 'Ações de Mercado' }).click()
    await page.getByRole('link', { name: 'Nova subcategoria' }).click()

    await expect.element(page.getByRole('dialog', { name: 'Nova categoria' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: /^Dentro de/ }).getByText('Mercado'))
      .toBeVisible()
    await expect.element(page.getByRole('radio', { name: 'Mercado' })).toBeChecked()
    await page.getByLabelText(/^Nome/).fill('Hortifrúti')
    await page.getByRole('button', { name: 'Criar categoria' }).click()

    await expect.element(page.getByText('Hortifrúti criada.')).toBeVisible()
    expect(sent).toEqual([
      {
        kind: 'expense_category',
        name: 'Hortifrúti',
        parentId: GROCERIES,
        incomeNature: null,
        icon: 'groceries',
        color: null,
      },
    ])
    await expect
      .poll(() => app.router.state.location.search)
      .toEqual({ kind: 'expense', created: CREATED })
    await expect
      .poll(() => JSON.parse(localStorage.getItem(`openCategories:${WORKSPACE_ID}`) ?? '[]'))
      .toEqual([GROCERIES])
  })

  it('asks for the nature of an income category', async () => {
    const sent: unknown[] = []
    await openCategories('?kind=income&category=new', {
      [`POST ${BASE}/accounts`]: recordJson(sent, () =>
        Response.json({ accountId: CREATED }, { status: 201 }),
      ),
    })
    await expect.element(page.getByRole('radio', { name: 'Receita' })).toBeChecked()
    await page.getByLabelText(/^Nome/).fill('Comissão')

    await page.getByRole('button', { name: 'Criar categoria' }).click({ force: true })
    await expect.element(page.getByText('Escolha a natureza da receita.')).toBeVisible()
    await page.getByRole('radio', { name: /Renda variável/ }).click()
    await page.getByRole('button', { name: 'Criar categoria' }).click()

    await expect.element(page.getByText('Comissão criada.')).toBeVisible()
    expect(sent).toEqual([
      expect.objectContaining({ kind: 'income_category', incomeNature: 'variable' }),
    ])
  })

  it('keeps a category with subcategories at the top and says why', async () => {
    await openCategories(`?category=${GROCERIES}`)

    await expect.element(page.getByRole('dialog', { name: 'Editar categoria' })).toBeVisible()
    await expect
      .element(page.getByRole('group', { name: 'Dentro de' }))
      .toHaveAccessibleDescription(
        'Mercado tem subcategorias, então continua principal. Para colocar Mercado dentro de outra, mova ou exclua Feira e Padaria antes.',
      )
  })

  it('turns a subcategory into a main category', async () => {
    const sent: unknown[] = []
    await openCategories(`?category=${MARKET}`, {
      [`PATCH ${BASE}/accounts/${MARKET}`]: recordJson(
        sent,
        () => new Response(null, { status: 204 }),
      ),
    })
    await page.getByRole('button', { name: /^Dentro de/ }).click()
    await page.getByRole('button', { name: /^Nenhuma \(principal\)/ }).click()
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect.element(page.getByText('Alterações salvas.')).toBeVisible()
    expect(sent).toEqual([{ parentId: null }])
  })

  it('has no accessibility violations', async () => {
    await openCategories('?category=new')
    const dialog = page.getByRole('dialog', { name: 'Nova categoria' })
    await expect.element(dialog).toBeVisible()

    await expectNoAccessibilityViolations(dialog.element())
  })
})
