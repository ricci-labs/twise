import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { CARD, GROCERIES, MEMBER_A } from '@web/testing/accounts-api'
import { entriesListAnswers, listedEntry, OCTOBER_ENTRIES } from '@web/testing/entries-api'
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
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const ENTRIES = `GET ${BASE}/entries`

async function openEntries({
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
    ...entriesListAnswers(answers),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/entries${search}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

function middleOf(element: Element): number {
  const { top, height } = element.getBoundingClientRect()
  return top + height / 2
}

function asked(requests: URL[]): FakeAnswer {
  return (request) => {
    requests.push(new URL(request.url))
    return Response.json({ items: OCTOBER_ENTRIES, nextCursor: null })
  }
}

describe('ENT-01 entries list', () => {
  beforeEach(async () => {
    await page.viewport(390, 844)
  })

  it('lists the period by day, newest first, with the summary of the API', async () => {
    const requests: URL[] = []
    await page.viewport(390, 844)
    await openEntries({ answers: { [ENTRIES]: asked(requests) } })

    await expect.element(page.getByRole('heading', { name: 'Lançamentos', level: 1 })).toBeVisible()
    await expect.element(page.getByRole('button', { name: /out\/26/ })).toBeVisible()
    const today = page.getByRole('region', { name: 'Hoje · ter, 20 out' })
    await expect.element(today.getByText('Mercado › Feira · Conta X')).toBeVisible()
    await expect.element(today.getByText('em 3 parcelas')).toBeInTheDocument()
    await expect
      .element(
        page
          .getByRole('region', { name: 'Ontem · seg, 19 out' })
          .getByText('Mercado · Conta X · por Member B'),
      )
      .toBeVisible()
    await expect.element(page.getByText('Conta X → Poupança')).toBeVisible()
    await expect.element(page.getByText('+R$ 6.200,00')).toBeVisible()
    await expect
      .poll(() => page.getByText(/^Saiu/).element().parentElement?.textContent?.replace(/\s/g, ' '))
      .toBe('Saiu R$ 1.141,30Entrou R$ 6.200,005 lançamentos')
    expect(requests[0]?.searchParams.get('from')).toBe('2026-10-05')
    expect(requests[0]?.searchParams.get('to')).toBe('2026-11-04')
    expect(requests[0]?.searchParams.get('limit')).toBe('50')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('ends the period and leads to the one before', async () => {
    const app = await openEntries()

    await expect.element(page.getByText('Isso é tudo de out/26.')).toBeVisible()
    await page.getByRole('link', { name: 'Ver set/26' }).click()
    await expect.poll(() => app.router.state.location.search).toMatchObject({ period: '2026-09' })
  })

  it('shows 50 at a time and the next ones with "Mostrar mais"', async () => {
    const pages: URL[] = []
    await openEntries({
      answers: {
        [ENTRIES]: (request) => {
          const url = new URL(request.url)
          pages.push(url)
          return url.searchParams.get('cursor')
            ? Response.json({
                items: [listedEntry('old', '2026-10-06', 'Padaria', 'expense', [])],
                nextCursor: null,
              })
            : Response.json({ items: OCTOBER_ENTRIES, nextCursor: 'cursor-2' })
        },
      },
    })

    await expect.element(page.getByText('Isso é tudo de out/26.')).not.toBeInTheDocument()
    await page.getByRole('button', { name: 'Mostrar mais' }).click()
    await expect.element(page.getByText('Padaria')).toBeVisible()
    expect(pages.at(-1)?.searchParams.get('cursor')).toBe('cursor-2')
    await expect.element(page.getByText('Isso é tudo de out/26.')).toBeVisible()
  })

  it('says the period is empty and offers a new entry', async () => {
    await openEntries({
      answers: { [ENTRIES]: () => Response.json({ items: [], nextCursor: null }) },
    })

    await expect.element(page.getByText('Nenhum lançamento neste período.')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Novo lançamento' }).last()).toBeVisible()
  })

  it('says what failed with its code and tries again', async () => {
    let isDown = true
    await openEntries({
      answers: {
        [ENTRIES]: () =>
          isDown
            ? apiError('INTERNAL_ERROR', 500)
            : Response.json({ items: OCTOBER_ENTRIES, nextCursor: null }),
      },
    })

    await expect
      .element(page.getByText('Não foi possível carregar os lançamentos.'), { timeout: 10_000 })
      .toBeVisible()
    isDown = false
    await page.getByRole('button', { name: 'Tentar de novo' }).click()
    await expect.element(page.getByText('Mercado da semana')).toBeVisible()
  })

  it('clears filters the API refuses and says so', async () => {
    const app = await openEntries({
      search: `?categoryId=${'00000000-0000-4000-8000-0000000000ff'}`,
      answers: {
        [ENTRIES]: (request) =>
          new URL(request.url).searchParams.get('categoryId')
            ? apiError('ENTRY_QUERY_INVALID', 400)
            : Response.json({ items: OCTOBER_ENTRIES, nextCursor: null }),
      },
    })

    await expect.element(page.getByText('Os filtros eram inválidos e foram limpos.')).toBeVisible()
    await expect
      .poll(() => app.router.state.location.search)
      .not.toHaveProperty('categoryId', expect.anything())
    await expect.element(page.getByText('Mercado da semana')).toBeVisible()
  })

  it('picks the last 30 days from the period sheet', async () => {
    const requests: URL[] = []
    await page.viewport(390, 844)
    await openEntries({ answers: { [ENTRIES]: asked(requests) } })

    await page.getByRole('button', { name: /out\/26/ }).click()
    await page.getByRole('button', { name: 'Últimos 30 dias' }).click()

    await expect.element(page.getByRole('button', { name: /Últimos 30 dias/ })).toBeVisible()
    await expect.poll(() => requests.at(-1)?.searchParams.get('from')).toBe('2026-09-21')
    expect(requests.at(-1)?.searchParams.get('to')).toBe('2026-10-20')
    await expect.element(page.getByText('Isso é tudo nesse intervalo.')).toBeVisible()
  })

  it('searches in the API from the second letter, marks the match and widens to every period', async () => {
    const requests: URL[] = []
    await page.viewport(390, 844)
    await openEntries({
      answers: {
        [ENTRIES]: (request) => {
          const url = new URL(request.url)
          requests.push(url)
          return Response.json({
            items: url.searchParams.get('q') ? OCTOBER_ENTRIES.slice(0, 1) : OCTOBER_ENTRIES,
            nextCursor: null,
          })
        },
        [`GET ${BASE}/entries/summary`]: (request) =>
          Response.json({
            outCents: 8640,
            inCents: 0,
            count: new URL(request.url).searchParams.get('q') ? 1 : 5,
          }),
      },
    })
    const search = page.getByRole('searchbox', { name: 'Buscar pela descrição' })

    await search.fill('m')
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(requests.every((url) => !url.searchParams.has('q'))).toBe(true)
    await search.fill('MERC')
    await expect.element(page.getByText(/1 resultado em out\/26\./)).toBeVisible()
    expect(requests.at(-1)?.searchParams.get('q')).toBe('MERC')
    expect(requests.at(-1)?.searchParams.get('from')).toBe('2026-10-05')
    await expect.poll(() => document.querySelector('mark')?.textContent).toBe('Merc')

    await page.getByRole('button', { name: 'Buscar em todos os períodos' }).click()
    await expect.element(page.getByText(/1 resultado em todos os períodos\./)).toBeVisible()
    expect(requests.at(-1)?.searchParams.has('from')).toBe(false)
    await expect.element(page.getByText('Isso é tudo com essa busca.')).toBeVisible()

    await page.getByRole('button', { name: 'Limpar busca' }).click()
    await expect.element(page.getByText(/^Saiu/)).toBeVisible()
    await expect.element(page.getByText('Isso é tudo de out/26.')).toBeVisible()
  })

  it('filters in the API from the sheet, shows the chips and takes them off one by one', async () => {
    const requests: URL[] = []
    await page.viewport(390, 844)
    await openEntries({ answers: { [ENTRIES]: asked(requests) } })

    await page.getByRole('button', { name: 'Filtros' }).click()
    const sheet = page.getByRole('dialog', { name: 'Filtros' })
    await sheet.getByRole('button', { name: 'Compra no cartão' }).click()
    await sheet.getByRole('button', { name: 'Conta ou cartão: Todas as contas e cartões' }).click()
    await page
      .getByRole('dialog', { name: 'Conta ou cartão' })
      .getByRole('button', { name: /Cartão X/ })
      .click()
    await sheet.getByRole('switch', { name: 'Só os divididos com contatos' }).click()
    await expect
      .element(sheet.getByRole('switch', { name: 'Só os divididos com contatos' }))
      .toBeChecked()
    await expectNoAccessibilityViolations(sheet.element())
    await sheet.getByRole('button', { name: 'Ver resultados' }).click()

    await expect.poll(() => requests.at(-1)?.searchParams.get('types')).toBe('card_purchase')
    expect(requests.at(-1)?.searchParams.get('accountId')).toBe(CARD)
    expect(requests.at(-1)?.searchParams.get('shared')).toBe('true')
    await expect.element(page.getByRole('button', { name: 'Filtros, 3 ativos' })).toBeVisible()
    expect(
      middleOf(page.getByRole('button', { name: 'Filtros, 3 ativos' }).element()) -
        middleOf(page.getByRole('searchbox').element()),
    ).toBeCloseTo(0, 0)
    await page.getByRole('button', { name: 'Tirar o filtro Cartão X' }).click()
    await expect.poll(() => requests.at(-1)?.searchParams.has('accountId')).toBe(false)
    await page.getByRole('button', { name: 'Limpar', exact: true }).click()
    await expect
      .element(page.getByRole('group', { name: 'Filtros ativos' }))
      .not.toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: 'Filtros', exact: true })).toBeVisible()
  })

  it('filters on the desktop from one menu per filter, each showing its value', async () => {
    const requests: URL[] = []
    await page.viewport(1440, 900)
    const app = await openEntries({ answers: { [ENTRIES]: asked(requests) } })

    const bar = page.getByRole('group', { name: 'Filtros' })
    await expect.element(bar).toBeVisible()
    expect(page.getByRole('button', { name: 'Filtros', exact: true }).query()).toBeNull()
    await bar.getByRole('button', { name: 'Tipo' }).click()
    const types = page.getByRole('menu')
    await types.getByRole('menuitemcheckbox', { name: 'Compra no cartão' }).click()
    await expect.poll(() => requests.at(-1)?.searchParams.get('types')).toBe('card_purchase')
    await types.getByRole('menuitemcheckbox', { name: 'Despesa' }).click()
    await expect
      .poll(() => requests.at(-1)?.searchParams.get('types'))
      .toBe('expense,card_purchase')
    await expect.element(bar.getByRole('button', { name: 'Tipo: 2 tipos' })).toBeVisible()
    await expectNoAccessibilityViolations(types.element())
    await userEvent.keyboard('{Escape}')

    await bar.getByRole('button', { name: 'Conta ou cartão' }).click()
    await page
      .getByRole('dialog', { name: 'Conta ou cartão' })
      .getByRole('button', { name: /Cartão X/ })
      .click()
    await expect.poll(() => requests.at(-1)?.searchParams.get('accountId')).toBe(CARD)
    await expect
      .element(bar.getByRole('button', { name: 'Conta ou cartão: Cartão X' }))
      .toBeVisible()

    await bar.getByRole('button', { name: 'Quem gastou' }).click()
    await page.getByRole('menuitem', { name: 'Só os divididos com contatos' }).click()
    await expect.poll(() => requests.at(-1)?.searchParams.get('shared')).toBe('true')
    await expect
      .element(bar.getByRole('button', { name: 'Quem gastou: Divididos com contatos' }))
      .toBeVisible()

    await bar.getByRole('button', { name: 'Limpar filtros' }).click()
    await expect.poll(() => app.router.state.location.search).toEqual({})
    await expect.element(bar.getByRole('button', { name: 'Tipo', exact: true })).toBeVisible()
    await expect
      .element(bar.getByRole('button', { name: 'Limpar filtros' }))
      .not.toBeInTheDocument()
  })

  it("shows the desktop table with the days as bands and each row's actions", async () => {
    const deleted: string[] = []
    await page.viewport(1440, 900)
    const app = await openEntries({
      search: '?types=%5B%22expense%22%5D',
      answers: {
        [`DELETE ${BASE}/entries/e1`]: (request) => {
          deleted.push(new URL(request.url).pathname)
          return new Response(null, { status: 204 })
        },
      },
    })

    const table = page.getByRole('table', { name: 'Lançamentos' })
    await expect.element(page.getByRole('heading', { name: 'Outubro', level: 2 })).toBeVisible()
    await expect.element(table.getByRole('columnheader', { name: 'Quem gastou' })).toBeVisible()
    await expect.element(table.getByText('Hoje · ter, 20 out')).toBeVisible()
    const purchase = table.getByRole('row', { name: /Tênis de corrida/ })
    await expect.element(purchase.getByText('Cartão X')).toBeVisible()
    await expect.element(purchase.getByText('em 3 parcelas')).toBeInTheDocument()
    await expect
      .element(table.getByRole('row', { name: /Reserva/ }).getByText('Conta X → Poupança'))
      .toBeVisible()
    await expectNoAccessibilityViolations(table.element())

    await table.getByRole('button', { name: 'Ações de Mercado da semana' }).click()
    await expect
      .element(page.getByRole('menuitem', { name: 'Editar' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/entries/e1?edit=true`)
    await page.getByRole('menuitem', { name: 'Excluir', exact: true }).click()
    await expect.poll(() => deleted).toEqual([`${BASE}/entries/e1`])
    await expect.element(page.getByText('Lançamento movido para a lixeira.')).toBeVisible()
    expect(app.router.state.location.search).toEqual({ types: ['expense'] })
  })

  it('says nothing matched the filters and clears them', async () => {
    await openEntries({
      search: '?types=%5B%22income%22%5D',
      answers: { [ENTRIES]: () => Response.json({ items: [], nextCursor: null }) },
    })

    await expect.element(page.getByText('Nada encontrado com esses filtros.')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Tirar o filtro Receita' })).toBeVisible()
  })

  it('opens filtered by a category, with its subcategories, and goes back there', async () => {
    const requests: URL[] = []
    const app = await openEntries({
      search: `?categoryId=${GROCERIES}&back=categories`,
      answers: { [ENTRIES]: asked(requests) },
    })

    await expect
      .element(page.getByRole('button', { name: 'Tirar o filtro Mercado e subcategorias' }))
      .toBeVisible()
    expect(requests.at(-1)?.searchParams.get('categoryId')).toBe(GROCERIES)
    await page.getByRole('link', { name: 'Voltar para Categorias' }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/categories`)
  })

  it('opens an entry from its row', async () => {
    const app = await openEntries()

    await page.getByRole('link', { name: /Mercado da semana/ }).click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/entries/e1`)
  })

  it('hides the trash from a viewer', async () => {
    await openEntries({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })

    await expect.element(page.getByText('Mercado da semana')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Lixeira de lançamentos' }))
      .not.toBeInTheDocument()
  })
})
