import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { MEMBER_A } from '@web/testing/accounts-api'
import { entriesListAnswers } from '@web/testing/entries-api'
import {
  accessAs,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import {
  candidatesAnswer,
  INTERNET_CANDIDATES,
  occurrencesAnswer,
  overviewAnswer,
  plannedOccurrence,
  RENT_RULE,
  recurrencesAnswer,
} from '@web/testing/planning-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const GROCERIES_ID = '00000000-0000-4000-8000-0000000000e1'
const HOUSE_ID = '00000000-0000-4000-8000-0000000000e4'

async function openPlanning({
  path = 'planning',
  access = workspaceAccess,
  answers = {},
}: {
  path?: string
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...entriesListAnswers(),
    ...occurrencesAnswer(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/${path}`] }))
  await render(<AppProviders app={app} />)
  return app
}

describe('PLAN-03 planned occurrences', () => {
  it('opens Planning on Previstos with the period, what is left and each group', async () => {
    const app = await openPlanning()
    await expect
      .element(page.getByRole('heading', { name: 'Planejamento', level: 1 }))
      .toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Previstos' }))
      .toHaveAttribute('aria-pressed', 'true')
    expect(app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/planning/occurrences`)
    await expect.element(page.getByText('R$ 369,90')).toBeVisible()
    await expect.element(page.getByText('3 contas, 1 atrasada')).toBeVisible()
    await expect.element(page.getByRole('region', { name: /Atrasados/ })).toBeVisible()
    await expect.element(page.getByRole('region', { name: /A vencer/ })).toBeVisible()
    await expect.element(page.getByText(/Conta X · pago em 16\/10/)).toBeVisible()
    await expect.element(page.getByText(/Conta X → Poupança · pulado$/)).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('asks the API for the chosen period', async () => {
    const asked: string[] = []
    await openPlanning({
      path: 'planning/occurrences?period=2026-11',
      answers: {
        [`GET ${BASE}/occurrences`]: (request) => {
          const url = new URL(request.url)
          asked.push(`${url.searchParams.get('from')} ${url.searchParams.get('to')}`)
          return Response.json({ items: [], totals: emptyTotals() })
        },
      },
    })
    await expect.element(page.getByText('Nada previsto neste período.')).toBeVisible()
    expect(asked).toContain('2026-11-05 2026-12-04')
  })

  it('shows five of a long group and the rest on "Mostrar mais"', async () => {
    const many = Array.from({ length: 7 }, (_, index) =>
      plannedOccurrence(`m${index}`, `2026-10-2${index + 1}`, `Conta ${index + 1}`),
    )
    await openPlanning({
      answers: occurrencesAnswer(many, {
        ...emptyTotals(),
        groups: { overdue: 0, upcoming: 7, matched: 0, skipped: 0 },
      }),
    })
    const group = page.getByRole('region', { name: /A vencer/ })
    await expect.element(group.getByText('Conta 5')).toBeVisible()
    await expect.element(group.getByText('Conta 6')).not.toBeInTheDocument()
    await group.getByRole('button', { name: /Mostrar mais/ }).click()
    await expect.element(group.getByText('Conta 7')).toBeVisible()
  })

  it('offers the first recurrence when nothing is planned', async () => {
    await openPlanning({ answers: occurrencesAnswer([], emptyTotals()) })
    await expect.element(page.getByRole('link', { name: 'Nova conta fixa' })).toBeVisible()
  })

  it('offers a viewer no recurrence to create', async () => {
    await openPlanning({
      answers: occurrencesAnswer([], emptyTotals()),
      access: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })
    await expect.element(page.getByText('Nada previsto neste período.')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Nova conta fixa' }))
      .not.toBeInTheDocument()
  })

  it('says the occurrences failed, with the ref, and tries again', async () => {
    await openPlanning({
      answers: {
        [`GET ${BASE}/occurrences`]: () =>
          Response.json(
            { error: { code: 'INTERNAL', message: 'x', ref: 'abcd1234' } },
            { status: 500 },
          ),
      },
    })
    await expect.element(page.getByText('Não deu para carregar os previstos.')).toBeVisible()
    await expect.element(page.getByText(/abcd1234/)).toBeVisible()
  })

  it('switches tabs, the ones still to come saying so', async () => {
    const app = await openPlanning()
    await page.getByRole('button', { name: 'Metas' }).click()
    await expect.element(page.getByText('Ainda não chegou aqui.')).toBeVisible()
    expect(app.router.state.location.pathname).toBe(`/w/${WORKSPACE_ID}/planning/goals`)
  })
})

function emptyTotals() {
  return {
    toPay: { amountCents: 0, count: 0, overdueCount: 0 },
    toReceive: { amountCents: 0, count: 0, overdueCount: 0 },
    groups: { overdue: 0, upcoming: 0, matched: 0, skipped: 0 },
  }
}

describe('PLAN-03 actions on a phone', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  function recorder(calls: string[]): FakeAnswer {
    return async (request) => {
      const body = request.method === 'PATCH' ? ` ${await request.text()}` : ''
      calls.push(`${request.method} ${new URL(request.url).pathname.replace(BASE, '')}${body}`)
      return new Response(null, { status: 204 })
    }
  }

  function occurrenceCalls(calls: string[]): Record<string, FakeAnswer> {
    const record = recorder(calls)
    return Object.fromEntries(
      ['o1', 'o5', 'o6'].flatMap((id) => [
        [`POST ${BASE}/occurrences/${id}/skip`, record],
        [`POST ${BASE}/occurrences/${id}/unskip`, record],
        [`POST ${BASE}/occurrences/${id}/unmatch`, record],
        [`POST ${BASE}/occurrences/${id}/match`, record],
        [`PATCH ${BASE}/occurrences/${id}`, record],
      ]),
    )
  }

  it('skips this month without asking, and undoes it from the toast', async () => {
    const calls: string[] = []
    await openPlanning({ answers: occurrenceCalls(calls) })
    await page.getByRole('button', { name: /^Internet/ }).click()
    await expect.element(page.getByText('Prevista para 18/10 · R$ 120,00 · Conta X')).toBeVisible()
    await page.getByRole('button', { name: 'Pular este mês' }).click()
    await expect.element(page.getByText('Internet de 18/10 pulada.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()
    await expect
      .poll(() => calls)
      .toEqual(['POST /occurrences/o1/skip', 'POST /occurrences/o1/unskip'])
  })

  it('undoes a payment and links the entry back from the toast', async () => {
    const calls: string[] = []
    await openPlanning({ answers: occurrenceCalls(calls) })
    await page.getByRole('button', { name: /^Diarista/ }).click()
    await expect.element(page.getByText('Pago em 16/10 com a Conta X')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Ver lançamento' })).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer pagamento' }).click()
    await page.getByRole('button', { name: 'Desfazer' }).click()
    await expect
      .poll(() => calls)
      .toEqual(['POST /occurrences/o5/unmatch', 'POST /occurrences/o5/match'])
  })

  it("changes only this month's amount", async () => {
    const calls: string[] = []
    await openPlanning({ answers: occurrenceCalls(calls) })
    await page.getByRole('button', { name: /^Internet/ }).click()
    await page.getByRole('button', { name: 'Mudar o valor deste' }).click()
    const amount = page.getByRole('textbox', { name: /Valor deste mês/ })
    await expect
      .element(page.getByText(/Não muda a conta fixa: os próximos meses continuam com/))
      .toBeVisible()
    await amount.fill('150,00')
    await page.getByRole('button', { name: 'Salvar valor' }).click()
    await expect.poll(() => calls).toEqual(['PATCH /occurrences/o1 {"amountCents":15000}'])
    await expect.element(page.getByText('Valor deste mês salvo.')).toBeVisible()
  })

  it('marks an entry already recorded as the payment, the likely one chosen first', async () => {
    const calls: string[] = []
    const record = recorder(calls)
    await openPlanning({
      answers: {
        ...candidatesAnswer('o1'),
        [`POST ${BASE}/occurrences/o1/match`]: async (request) => {
          calls.push(`match ${await request.text()}`)
          return new Response(null, { status: 204 })
        },
        [`POST ${BASE}/occurrences/o1/unmatch`]: record,
      },
    })
    await page.getByRole('button', { name: /^Internet/ }).click()
    await page.getByRole('button', { name: 'Já registrei' }).click()
    const sheet = page.getByRole('dialog', { name: 'Já registrei' })
    await expect.element(sheet.getByText(/Lançamentos de despesa da Conta X/)).toBeVisible()
    await expect.element(sheet.getByRole('radio', { name: /Internet Fibra/ })).toBeChecked()
    await expect.element(sheet.getByText('Mais provável')).toBeVisible()
    await expectNoAccessibilityViolations(sheet.element())
    await sheet.getByRole('radio', { name: /Mercado da semana/ }).click()
    await sheet.getByRole('button', { name: 'Marcar como pago' }).click()
    await expect.element(page.getByText('Internet de 18/10 marcada como paga.')).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer' }).click()
    await expect
      .poll(() => calls)
      .toEqual([
        `match {"entryId":"${INTERNET_CANDIDATES[1]?.entryId}"}`,
        'POST /occurrences/o1/unmatch',
      ])
  })

  it('shows a refused match in the sheet', async () => {
    await openPlanning({
      answers: {
        ...candidatesAnswer('o1'),
        [`POST ${BASE}/occurrences/o1/match`]: () =>
          Response.json(
            { error: { code: 'ENTRY_ALREADY_MATCHED', message: 'x', ref: 'r1' } },
            { status: 409 },
          ),
      },
    })
    await page.getByRole('button', { name: /^Internet/ }).click()
    await page.getByRole('button', { name: 'Já registrei' }).click()
    const sheet = page.getByRole('dialog', { name: 'Já registrei' })
    await sheet.getByRole('button', { name: 'Marcar como pago' }).click()
    await expect.element(sheet.getByText('Esse lançamento já paga outro previsto.')).toBeVisible()
  })

  it('opens the new entry for an overdue bill from its compact button', async () => {
    const overdueId = '00000000-0000-4000-8000-0000000007a1'
    const app = await openPlanning({
      answers: occurrencesAnswer([
        plannedOccurrence(overdueId, '2026-10-18', 'Internet', { isOverdue: true }),
      ]),
    })
    await page.getByRole('button', { name: 'Registrar pagamento de Internet' }).click()
    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({ entry: 'new', entryOccurrence: overdueId })
  })

  it('offers "Registrar recebimento" for an income', async () => {
    await openPlanning()
    await page.getByRole('button', { name: /^Vale-alimentação/ }).click()
    await expect.element(page.getByRole('link', { name: 'Registrar recebimento' })).toBeVisible()
  })

  it('brings a skipped one back', async () => {
    const calls: string[] = []
    await openPlanning({ answers: occurrenceCalls(calls) })
    await page.getByRole('button', { name: /^Reserva/ }).click()
    await page.getByRole('button', { name: 'Voltar a esperar' }).click()
    await expect.poll(() => calls).toEqual(['POST /occurrences/o6/unskip'])
  })

  it('gives a viewer no actions on the rows', async () => {
    await openPlanning({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })
    await expect.element(page.getByText('Internet')).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Internet/ })).not.toBeInTheDocument()
  })
})

describe('PLAN-01 recurring bills and incomes', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('shows the monthly totals and each group, rows worded with their next date', async () => {
    await openPlanning({ path: 'planning/recurrences', answers: recurrencesAnswer() })
    await expect.element(page.getByText('Contas fixas por mês')).toBeVisible()
    await expect.element(page.getByText('R$ 2.220,00')).toBeVisible()
    await expect.element(page.getByText('2 contas')).toBeVisible()
    await expect.element(page.getByRole('region', { name: /Contas e assinaturas/ })).toBeVisible()
    await expect.element(page.getByRole('region', { name: /Receitas/ })).toBeVisible()
    await expect.element(page.getByText('Todo dia 5 · Conta X → Poupança')).toBeVisible()
    await expect.element(page.getByText('Atrasada desde 18/10')).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('deletes a recurrence after asking, and says so', async () => {
    const calls: string[] = []
    await openPlanning({
      path: 'planning/recurrences',
      answers: {
        ...recurrencesAnswer(),
        [`DELETE ${BASE}/recurrences/${RENT_RULE}`]: (request) => {
          calls.push(new URL(request.url).pathname.replace(BASE, ''))
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: /^Aluguel/ }).click()
    await page.getByRole('button', { name: 'Excluir' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Excluir Aluguel?' })
    await expect.element(dialog.getByText(/Os previstos pendentes dela somem/)).toBeVisible()
    await dialog.getByRole('button', { name: 'Excluir' }).click()
    await expect.element(page.getByText('Aluguel excluída.')).toBeVisible()
    expect(calls).toEqual([`/recurrences/${RENT_RULE}`])
  })

  it('opens Previstos showing only the occurrences of a recurrence, with a chip to undo it', async () => {
    const app = await openPlanning({
      path: 'planning/recurrences',
      answers: {
        ...recurrencesAnswer(),
        ...occurrencesAnswer([
          plannedOccurrence('r1', '2026-10-25', 'Aluguel', { ruleId: RENT_RULE }),
          plannedOccurrence('r2', '2026-10-18', 'Internet', { isOverdue: true }),
        ]),
      },
    })
    await page.getByRole('button', { name: /^Aluguel/ }).click()
    await page.getByRole('link', { name: 'Ver previstos' }).click()
    await expect.element(page.getByRole('button', { name: /Tirar o filtro Aluguel/ })).toBeVisible()
    await expect.element(page.getByText('Internet')).not.toBeInTheDocument()
    await expect.element(page.getByText('Falta pagar')).not.toBeInTheDocument()
    await page.getByRole('button', { name: /Tirar o filtro Aluguel/ }).click()
    await expect.element(page.getByText('Internet')).toBeVisible()
    expect(app.router.state.location.search).not.toHaveProperty('rule')
  })

  it('says when nothing is set up yet', async () => {
    await openPlanning({
      path: 'planning/recurrences',
      answers: recurrencesAnswer([], {
        bills: { monthlyCents: 0, count: 0, includesEstimate: false, includesAveraged: false },
        income: { monthlyCents: 0, count: 0, leftOutEstimateCents: 0, leftOutEstimateCount: 0 },
        transfers: { monthlyCents: 0, count: 0 },
      }),
    })
    await expect.element(page.getByText('Nenhuma conta fixa cadastrada.')).toBeVisible()
  })

  it('gives a viewer no actions on the rows', async () => {
    await openPlanning({
      path: 'planning/recurrences',
      answers: recurrencesAnswer(),
      access: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })
    await expect.element(page.getByText('Aluguel')).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Aluguel/ })).not.toBeInTheDocument()
  })
})

describe('PLAN-04 budgets', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  function budgetCalls(calls: string[]): Record<string, FakeAnswer> {
    return Object.fromEntries(
      [GROCERIES_ID, HOUSE_ID].map((id) => [
        `PUT ${BASE}/budgets/${id}`,
        async (request: Request) => {
          calls.push(`${id} ${await request.text()}`)
          return new Response(null, { status: 204 })
        },
      ]),
    )
  }

  it('shows the summary with the pace, each budget in words and the categories without one', async () => {
    await openPlanning({ path: 'planning/budgets', answers: overviewAnswer() })
    await expect.element(page.getByText('Gasto nas categorias com orçamento')).toBeVisible()
    await expect.element(page.getByText(/dia 16 de 31/)).toBeVisible()
    await expect.element(page.getByText('Acima do ritmo: 16 pontos à frente')).toBeVisible()
    await expect.element(page.getByText(/Feira/)).toBeVisible()
    await expect.element(page.getByRole('region', { name: /Sem orçamento/ })).toBeVisible()
    await expect.element(page.getByText('Gasto no período: R$ 145,00')).toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('opens a budget with its spending by subcategory and the average, and saves it', async () => {
    const calls: string[] = []
    await openPlanning({
      path: 'planning/budgets',
      answers: { ...overviewAnswer(), ...budgetCalls(calls) },
    })
    await page.getByRole('button', { name: '+1 subcategorias de Mercado' }).click()
    const sheet = page.getByRole('dialog', { name: 'Orçamento de Mercado' })
    await expect.element(sheet.getByText('Direto em Mercado')).toBeVisible()
    await expect
      .element(sheet.getByText(/Nos últimos 3 meses vocês gastaram em média/))
      .toBeVisible()
    await expectNoAccessibilityViolations(sheet.element())
    await sheet.getByRole('textbox', { name: /Limite por mês/ }).fill('1.300,00')
    await sheet.getByRole('button', { name: 'Salvar orçamento' }).click()
    await expect
      .poll(() => calls)
      .toEqual([`${GROCERIES_ID} {"limitCents":130000,"fromPeriod":"2026-10"}`])
  })

  it('removes a budget from the period after asking', async () => {
    const calls: string[] = []
    await openPlanning({
      path: 'planning/budgets',
      answers: { ...overviewAnswer(), ...budgetCalls(calls) },
    })
    await page.getByRole('button', { name: 'Orçamento de Mercado' }).click()
    await page.getByRole('button', { name: 'Remover orçamento' }).click()
    const confirm = page.getByRole('alertdialog', {
      name: /Remover o orçamento de Mercado a partir de/,
    })
    await confirm.getByRole('button', { name: 'Remover' }).click()
    await expect
      .poll(() => calls)
      .toEqual([`${GROCERIES_ID} {"limitCents":null,"fromPeriod":"2026-10"}`])
  })

  it('defines a budget for a category without one', async () => {
    await openPlanning({ path: 'planning/budgets', answers: overviewAnswer() })
    await page.getByRole('button', { name: 'Definir orçamento de Casa' }).click()
    const sheet = page.getByRole('dialog', { name: 'Orçamento de Casa' })
    await expect.element(sheet.getByText('Categoria de despesa')).toBeVisible()
    await expect
      .element(sheet.getByRole('button', { name: 'Remover orçamento' }))
      .not.toBeInTheDocument()
  })

  it('lets someone without budgets:update only look', async () => {
    await openPlanning({
      path: 'planning/budgets',
      answers: overviewAnswer(),
      access: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })
    await expect.element(page.getByText('Acima do ritmo: 16 pontos à frente')).toBeVisible()
    await expect.element(page.getByRole('button', { name: /Definir/ })).not.toBeInTheDocument()
    await expect
      .element(page.getByRole('button', { name: 'Orçamento de Mercado' }))
      .not.toBeInTheDocument()
  })
})
