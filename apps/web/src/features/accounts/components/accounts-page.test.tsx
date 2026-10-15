import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import {
  ACCOUNTS,
  accountsAnswers,
  CARD,
  CHECKING,
  MEMBER_A,
  SAVINGS,
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

async function openAccounts({
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
    ...accountsAnswers(answers),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/accounts${search}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

describe('ACC-01 accounts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sums the money, lists accounts and cards apart, and hides the archived ones', async () => {
    await openAccounts()

    await expect.element(page.getByRole('heading', { name: 'Dinheiro' })).toBeVisible()
    await expect.element(page.getByText('Total em dinheiro')).toBeVisible()
    await expect.element(page.getByText('Conta corrente · Member A')).toBeVisible()
    await expect.element(page.getByText('Poupança · da casa')).toBeVisible()
    await expect.element(page.getByText('Em aberto · fecha 25/10 · vence 04/11')).toBeVisible()
    await expect.element(page.getByText('Mercado')).not.toBeInTheDocument()
    await expect.element(page.getByText('Conta antiga')).not.toBeInTheDocument()

    await page.getByRole('button', { name: 'Arquivadas (1)' }).click()

    await expect.element(page.getByText('Conta antiga')).toBeVisible()
  })

  it('draws a card without its own illustration with the card drawing', async () => {
    const withoutIcon = ACCOUNTS.map((account) =>
      account.id === CARD ? { ...account, icon: null } : account,
    )
    await openAccounts({ answers: { [`GET ${BASE}/accounts`]: () => Response.json(withoutIcon) } })

    const row = page.getByRole('listitem').filter({ hasText: 'Cartão X' })
    await expect.element(row).toBeVisible()
    expect(row.element().querySelector('[data-slot=category-art] img')).not.toBeNull()
  })

  it('has no accessibility violations', async () => {
    await openAccounts()
    await expect.element(page.getByRole('heading', { name: 'Cartões' })).toBeVisible()

    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('archives an account and undoes it from the toast', async () => {
    const posted: string[] = []
    const record = (request: Request) => {
      posted.push(new URL(request.url).pathname)
      return new Response(null, { status: 204 })
    }
    await openAccounts({
      answers: {
        [`POST ${BASE}/accounts/${CHECKING}/archive`]: record,
        [`POST ${BASE}/accounts/${CHECKING}/unarchive`]: record,
      },
    })

    await page.getByRole('button', { name: 'Ações de Conta X' }).click()
    await page.getByRole('button', { name: 'Arquivar' }).click()
    await expect.element(page.getByText('Conta X arquivada.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()

    await expect
      .poll(() => posted)
      .toEqual([`${BASE}/accounts/${CHECKING}/archive`, `${BASE}/accounts/${CHECKING}/unarchive`])
  })

  it("opens the new entry as the account's opening balance from its actions", async () => {
    const app = await openAccounts()

    await page.getByRole('button', { name: 'Ações de Conta X' }).click()
    await page.getByText('Informar saldo inicial').click()

    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({ entry: 'new', entryType: 'opening_balance', entryAccount: CHECKING })
  })

  it('offers the opening balance of a money account just created', async () => {
    const app = await openAccounts({ search: `?created=${CHECKING}` })

    await expect.element(page.getByRole('dialog', { name: 'Conta X criada' })).toBeVisible()
    await page.getByRole('button', { name: 'Informar saldo inicial' }).click()

    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({ entry: 'new', entryType: 'opening_balance', entryAccount: CHECKING })
  })

  it('offers to archive when the account cannot be deleted', async () => {
    const archived = vi.fn(() => new Response(null, { status: 204 }))
    await openAccounts({
      answers: {
        [`DELETE ${BASE}/accounts/${SAVINGS}`]: () => apiError('ACCOUNT_CANNOT_BE_DELETED', 409),
        [`POST ${BASE}/accounts/${SAVINGS}/archive`]: archived,
      },
    })

    await page.getByRole('button', { name: 'Ações de Poupança' }).click()
    await page.getByRole('button', { name: 'Excluir' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Não dá para excluir a Poupança' })
    await expect.element(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Arquivar' }).click()

    await expect.element(page.getByText('Poupança arquivada.')).toBeVisible()
    expect(archived).toHaveBeenCalledOnce()
  })

  it('opens the entries of an account from its actions, and from the row for a viewer', async () => {
    const app = await openAccounts()

    await page.getByRole('button', { name: 'Ações de Conta X' }).click()
    await page.getByText('Ver lançamentos').click()
    await expect.poll(() => app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/entries`)
    expect(app.router.state.location.search).toMatchObject({
      accountId: CHECKING,
      back: 'accounts',
    })
  })

  it('opens the entries of an account by its row for a viewer too', async () => {
    const app = await openAccounts({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await page
      .getByRole('link', { name: /Conta X/ })
      .first()
      .click()
    await expect.poll(() => app.router.state.location.search).toMatchObject({ accountId: CHECKING })
  })

  it('shows the accounts without actions, owners or trash to a viewer', async () => {
    await openAccounts({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Conta X')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Ações de Conta X' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('link', { name: 'Lixeira de contas' }))
      .not.toBeInTheDocument()
    await expect.element(page.getByText('Conta corrente', { exact: true })).toBeVisible()
  })

  it('starts with an empty block when there is no account', async () => {
    await openAccounts({ answers: { [`GET ${BASE}/accounts`]: () => Response.json([]) } })

    await expect.element(page.getByText('Nenhuma conta ainda.')).toBeVisible()
    await expect.element(page.getByText('Total em dinheiro')).not.toBeInTheDocument()
  })

  it('says it could not load, with the code, and tries again', async () => {
    let calls = 0
    await openAccounts({
      answers: {
        [`GET ${BASE}/accounts`]: () => {
          calls += 1
          return calls === 1 ? apiError('ACCESS_DENIED', 403) : Response.json(ACCOUNTS)
        },
      },
    })

    await expect.element(page.getByText('Não foi possível carregar as contas.')).toBeVisible()
    await expect.element(page.getByText('Código: abcd1234')).toBeVisible()
    await page.getByRole('button', { name: 'Tentar de novo' }).click()

    await expect.element(page.getByText('Conta corrente · Member A')).toBeVisible()
  })
})
