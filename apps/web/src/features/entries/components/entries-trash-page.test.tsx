import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, CHECKING, GROCERIES, MEMBER_A } from '@web/testing/accounts-api'
import { entriesListAnswers, listedEntry } from '@web/testing/entries-api'
import {
  accessAs,
  fakeApi,
  MEMBER_A_ID,
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
const TRASHED_ID = '00000000-0000-4000-8000-000000000401'
const OLD_ACCOUNT = '00000000-0000-4000-8000-0000000000c8'

const TRASHED = {
  ...listedEntry(TRASHED_ID, '2026-10-20', 'Mercado da semana', 'expense', [
    [GROCERIES, 8640],
    [CHECKING, -8640],
  ]),
  deletedAt: '2026-10-20T17:12:00.000Z',
  deletedByUserId: MEMBER_A_ID,
  deleteReason: 'lançado em dobro',
}

async function openTrash({
  access = workspaceAccess,
  answers = {},
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...accountsAnswers(),
    ...entriesListAnswers(),
    [`GET ${BASE}/entries/trash`]: () => Response.json({ items: [TRASHED], nextCursor: null }),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/trash`] }))
  await render(<AppProviders app={app} />)
  return app
}

function recorder(calls: string[]): FakeAnswer {
  return (request) => {
    calls.push(new URL(request.url).pathname.replace(BASE, ''))
    return new Response(null, { status: 204 })
  }
}

describe('ENT-05 entries trash', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T18:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lists the deleted entries with who, when and why, and restores one', async () => {
    const calls: string[] = []
    const app = await openTrash({
      answers: { [`POST ${BASE}/entries/${TRASHED_ID}/restore`]: recorder(calls) },
    })

    await expect.element(page.getByRole('heading', { name: 'Lixeira', level: 1 })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Lançamentos' }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect.element(page.getByText('Excluído hoje, 14:12, por Member A')).toBeVisible()
    await expect.element(page.getByText('Motivo: lançado em dobro')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Novo lançamento' }))
      .not.toBeInTheDocument()
    await expectNoAccessibilityViolations(page.getByRole('main').element())

    await page.getByRole('button', { name: 'Restaurar Mercado da semana' }).click()
    await expect.poll(() => calls).toEqual([`/entries/${TRASHED_ID}/restore`])
    await expect.element(page.getByText('Lançamento restaurado.')).toBeVisible()
    await page.getByRole('button', { name: 'Ver' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/entries/${TRASHED_ID}`)
  })

  it('offers to restore the deleted account first when that is why it was refused', async () => {
    const calls: string[] = []
    let isRefused = true
    await openTrash({
      answers: {
        [`POST ${BASE}/entries/${TRASHED_ID}/restore`]: (request) => {
          calls.push(new URL(request.url).pathname.replace(BASE, ''))
          if (isRefused) {
            isRefused = false
            return Response.json(
              {
                error: {
                  code: 'ENTRY_CANNOT_BE_RESTORED',
                  message: 'x',
                  ref: 'abcd1234',
                  details: {
                    reason: 'deleted_account',
                    accountId: OLD_ACCOUNT,
                    accountName: 'Conta Y',
                  },
                },
              },
              { status: 409 },
            )
          }
          return new Response(null, { status: 204 })
        },
        [`POST ${BASE}/accounts/${OLD_ACCOUNT}/restore`]: recorder(calls),
      },
    })

    await page.getByRole('button', { name: 'Restaurar Mercado da semana' }).click()
    await expect
      .element(page.getByText('Não dá para restaurar: ele usa a Conta Y, que está na lixeira.'))
      .toBeVisible()
    await page.getByRole('button', { name: 'Restaurar Conta Y' }).click()

    await expect
      .poll(() => calls)
      .toEqual([
        `/entries/${TRASHED_ID}/restore`,
        `/accounts/${OLD_ACCOUNT}/restore`,
        `/entries/${TRASHED_ID}/restore`,
      ])
    await expect.element(page.getByText('Lançamento restaurado.')).toBeVisible()
  })

  it('says a closed invoice keeps it in the trash', async () => {
    await openTrash({
      answers: {
        [`POST ${BASE}/entries/${TRASHED_ID}/restore`]: () =>
          Response.json(
            {
              error: {
                code: 'ENTRY_CANNOT_BE_RESTORED',
                message: 'x',
                details: { reason: 'closed_invoice' },
              },
            },
            { status: 409 },
          ),
      },
    })

    await page.getByRole('button', { name: 'Restaurar Mercado da semana' }).click()
    await expect
      .element(page.getByText('Não dá para restaurar: parte dele está numa fatura fechada.'))
      .toBeVisible()
  })

  it('says the trash is empty', async () => {
    await openTrash({
      answers: {
        [`GET ${BASE}/entries/trash`]: () => Response.json({ items: [], nextCursor: null }),
      },
    })

    await expect.element(page.getByText('A lixeira está vazia.')).toBeVisible()
    await expect
      .element(page.getByText('Lançamentos excluídos ficam aqui e podem voltar.'))
      .toBeVisible()
  })

  it('switches to the accounts and categories of the trash', async () => {
    const app = await openTrash()

    await page.getByRole('button', { name: 'Contas e categorias' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/accounts/trash`)
    await expect
      .element(page.getByRole('button', { name: 'Contas e categorias' }))
      .toHaveAttribute('aria-pressed', 'true')
  })

  it('marks Lançamentos on the phone tabs and Lixeira in the desktop menu', async () => {
    await openTrash()

    const tabs = page.getByRole('navigation', { name: 'Navegação' })
    await expect
      .element(tabs.getByRole('link', { name: 'Lançamentos' }))
      .toHaveAttribute('aria-current', 'page')
    await expect
      .element(tabs.getByRole('button', { name: 'Mais' }))
      .not.toHaveAttribute('aria-current')

    await page.viewport(1440, 900)
    const menu = page.getByRole('navigation', { name: 'Menu principal' })
    await expect
      .element(menu.getByRole('link', { name: 'Lixeira' }))
      .toHaveAttribute('aria-current', 'page')
    await expect
      .element(menu.getByRole('link', { name: 'Lançamentos' }))
      .not.toHaveAttribute('aria-current')
  })

  it('shows the trash as a table on the desktop and restores from it', async () => {
    const calls: string[] = []
    await page.viewport(1440, 900)
    await openTrash({
      answers: { [`POST ${BASE}/entries/${TRASHED_ID}/restore`]: recorder(calls) },
    })

    await expect
      .element(page.getByText('O que foi excluído pode voltar com o histórico.'))
      .toBeVisible()
    const table = page.getByRole('table', { name: 'Lançamentos excluídos' })
    const row = table.getByRole('row', { name: /Mercado da semana/ })
    await expect.element(row.getByText('Mercado · Conta X')).toBeVisible()
    await expect.element(row.getByText('Hoje, 14:12, por Member A')).toBeVisible()
    await expect.element(row.getByText('Lançado em dobro')).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())

    await row.getByRole('button', { name: 'Restaurar Mercado da semana' }).click()
    await expect.poll(() => calls).toEqual([`/entries/${TRASHED_ID}/restore`])
    await expect.element(page.getByText('Lançamento restaurado.')).toBeVisible()
  })

  it('tells a viewer the trash is not for them', async () => {
    await openTrash({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect
      .element(
        page.getByText('Você não tem acesso a esta área. Peça a um administrador do espaço.'),
      )
      .toBeVisible()
    await expect.element(page.getByRole('button', { name: /Restaurar/ })).not.toBeInTheDocument()
  })
})
