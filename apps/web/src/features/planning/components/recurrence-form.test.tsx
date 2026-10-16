import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { CHECKING, HOUSE, MEMBER_A } from '@web/testing/accounts-api'
import { entriesListAnswers } from '@web/testing/entries-api'
import {
  accessAs,
  apiError,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import {
  occurrencesAnswer,
  recurrenceFormAnswers,
  recurrencesAnswer,
} from '@web/testing/planning-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type Locator, page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const FORM_TITLE = 'Nova conta fixa'

async function openPlanning({
  path = 'planning/recurrences',
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
    ...recurrencesAnswer(),
    ...recurrenceFormAnswers(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/${path}`] }))
  await render(<AppProviders app={app} />)
  return app
}

function form() {
  return page.getByRole('dialog', { name: FORM_TITLE })
}

async function openNewRecurrence(path = 'planning/recurrences?recurrence=new') {
  const app = await openPlanning({ path })
  await expect.element(form()).toBeVisible()
  return app
}

async function expectRow(preview: Locator, position: number, texts: readonly string[]) {
  const row = preview.getByRole('listitem').nth(position)
  for (const text of texts) {
    await expect.element(row.getByText(text, { exact: true })).toBeVisible()
  }
}

async function fillGym() {
  await page.getByLabelText(/^Descrição/).fill('Academia')
  await page.getByLabelText(/^Valor/).fill('99,90')
  await page.getByRole('button', { name: /^Pago com/ }).click()
  await page.getByRole('button', { name: /^Conta X/ }).click()
  await page.getByRole('button', { name: /^Categoria/ }).click()
  await page.getByRole('button', { name: /^Casa/ }).click()
}

describe('PLAN-02 new recurrence', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens from the add link of its group, with the labels of its type', async () => {
    const app = await openPlanning()
    const incomes = page.getByRole('region', { name: /^Receitas/ })
    await incomes.getByRole('link', { name: 'Nova receita' }).click()

    await expect.element(form()).toBeVisible()
    expect(app.router.state.location.search).toMatchObject({
      recurrence: 'new',
      recurrenceType: 'income',
    })
    await expect.element(form().getByRole('radio', { name: 'Receita' })).toBeChecked()
    await expect.element(page.getByRole('button', { name: /^Recebido em/ })).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Criar receita' })).toBeVisible()
    await expect.element(page.getByLabelText(/^Descrição/)).toHaveFocus()
    await expectNoAccessibilityViolations(form().element())
  })

  it('renames the account fields and the button when the type changes', async () => {
    await openNewRecurrence()
    await expect.element(page.getByRole('button', { name: /^Pago com/ })).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Categoria/ })).toBeVisible()

    await page.getByRole('radio', { name: 'Compra no cartão' }).click()
    await expect.element(page.getByRole('button', { name: /^Cartão/ })).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Criar conta fixa' })).toBeVisible()

    await page.getByRole('radio', { name: 'Transferência' }).click()
    await expect.element(page.getByRole('button', { name: /^De/ })).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Para/ })).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Criar transferência' })).toBeVisible()
  })

  it('drops "Quando" for a weekly one, which repeats the weekday of the first date', async () => {
    await openNewRecurrence()
    await expect.element(page.getByRole('radiogroup', { name: 'Quando' })).toBeVisible()

    await page.getByRole('radio', { name: 'Semanal' }).click()

    await expect.element(page.getByRole('radiogroup', { name: 'Quando' })).not.toBeInTheDocument()
    await expect.element(page.getByRole('status', { name: 'A cada' })).toHaveTextContent('1')
    await expect.element(page.getByText('semana', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Aumentar o intervalo' }).click()
    await expect.element(page.getByText('semanas', { exact: true })).toBeVisible()
  })

  it('hides the weekend rule on a business day, which explains what one is', async () => {
    await openNewRecurrence()
    const weekend = page.getByRole('button', { name: /^Se cair em fim de semana ou feriado/ })
    await expect.element(weekend).toBeVisible()

    await page.getByRole('radio', { name: 'No 5º dia útil' }).click()

    await expect.element(weekend).not.toBeInTheDocument()
    await expect
      .element(page.getByText(/^Dia útil: de segunda a sexta, fora feriados bancários/))
      .toBeVisible()
  })

  it('previews the next three dates and why one moved', async () => {
    await openNewRecurrence()
    const preview = page.getByRole('status').filter({ hasText: 'Próximas datas' })
    await expectRow(preview, 0, ['20/10', 'ter'])
    await expectRow(preview, 1, ['20/11', 'sex'])
    await expectRow(preview, 2, ['20/12', 'dom'])

    await page.getByRole('button', { name: /^Se cair em fim de semana ou feriado/ }).click()
    await page.getByRole('button', { name: 'Adiar para o próximo dia útil' }).click()

    await expectRow(preview, 2, ['21/12', 'seg', 'dia 20 é domingo, foi para segunda'])

    await page.getByLabelText(/^Valor/).fill('180')
    await page.getByRole('switch', { name: 'O valor muda todo mês (aproximado)' }).click()
    const firstRow = preview.getByRole('listitem').first()
    await expect.element(firstRow.getByText('R$ 180,00')).toBeVisible()
    await expect.element(firstRow.getByText(/^≈/)).toBeVisible()
  })

  it("moves a date off the workspace's own holidays too", async () => {
    await openPlanning({
      path: 'planning/recurrences?recurrence=new',
      answers: recurrenceFormAnswers(['2026-10-20']),
    })
    await page.getByRole('button', { name: /^Se cair em fim de semana ou feriado/ }).click()
    await page.getByRole('button', { name: 'Adiar para o próximo dia útil' }).click()

    const preview = page.getByRole('status').filter({ hasText: 'Próximas datas' })
    await expectRow(preview, 0, ['21/10', 'qua', 'dia 20 é feriado, foi para quarta'])
  })

  it('creates the recurrence with the schedule chosen, says so and closes', async () => {
    const sent: unknown[] = []
    const app = await openPlanning({
      path: 'planning/recurrences?recurrence=new',
      answers: {
        [`POST ${BASE}/recurrences`]: async (request) => {
          sent.push(await request.json())
          return Response.json({ ruleId: '00000000-0000-4000-8000-0000000008f1' }, { status: 201 })
        },
      },
    })
    await expect.element(form()).toBeVisible()
    await fillGym()
    await page.getByRole('button', { name: 'Dia do mês: 20' }).click()
    await page.getByRole('radio', { name: '10', exact: true }).click()

    await page.getByRole('button', { name: 'Criar conta fixa' }).click()

    await expect.element(page.getByText('Academia criada.')).toBeVisible()
    await expect.element(form()).not.toBeInTheDocument()
    expect(app.router.state.location.search).not.toHaveProperty('recurrence')
    expect(sent).toEqual([
      {
        entryType: 'expense',
        description: 'Academia',
        amountCents: 9990,
        amountIsEstimate: false,
        sourceAccountId: CHECKING,
        categoryAccountId: HOUSE,
        schedule: {
          frequency: 'monthly',
          interval: 1,
          dayOfMonth: 10,
          nthBusinessDay: null,
          weekendRule: 'keep',
          startsOn: '2026-10-20',
          endsOn: null,
        },
        remindDaysBefore: null,
        autoRecord: false,
      },
    ])
  })

  it('asks for another account when the transfer goes to the same one', async () => {
    await openNewRecurrence('planning/recurrences?recurrence=new&recurrenceType=transfer')
    await page.getByRole('button', { name: /^De/ }).click()
    await page.getByRole('button', { name: /^Poupança/ }).click()
    await page.getByRole('button', { name: /^Para/ }).click()
    await page.getByRole('button', { name: /^Poupança/ }).click()

    await expect.element(page.getByText('Escolha uma conta diferente da de origem.')).toBeVisible()
  })

  it('does not let the end come before the first date', async () => {
    await openNewRecurrence()
    await page.getByRole('switch', { name: 'Tem data para terminar' }).click()
    await page.getByRole('button', { name: /^Termina em/ }).click()
    await page.getByRole('radio', { name: /^10/ }).click()

    await expect
      .element(page.getByText('A data final não pode ser antes da primeira.'))
      .toBeVisible()
  })

  it('shows accounts that do not fit the type as the form alert', async () => {
    await openPlanning({
      path: 'planning/recurrences?recurrence=new',
      answers: {
        [`POST ${BASE}/recurrences`]: () => apiError('RECURRENCE_ACCOUNTS_INVALID', 400),
      },
    })
    await expect.element(form()).toBeVisible()
    await fillGym()
    await page.getByRole('button', { name: 'Criar conta fixa' }).click()

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent('Confira as contas: elas precisam estar ativas e combinar com o tipo.')
    await expect.element(form()).toBeVisible()
  })

  it('asks before throwing away what was typed', async () => {
    await openNewRecurrence()
    await page.getByLabelText(/^Descrição/).fill('Academia')
    await form().getByRole('button', { name: 'Cancelar' }).click()

    const discard = page.getByRole('alertdialog', { name: 'Descartar as alterações?' })
    await discard.getByRole('button', { name: 'Descartar' }).click()
    await expect.element(form()).not.toBeInTheDocument()
  })

  it('offers the two first recurrences when there is none yet', async () => {
    await openPlanning({
      answers: recurrencesAnswer([], {
        bills: { monthlyCents: 0, count: 0, includesEstimate: false, includesAveraged: false },
        income: { monthlyCents: 0, count: 0, leftOutEstimateCents: 0, leftOutEstimateCount: 0 },
        transfers: { monthlyCents: 0, count: 0 },
      }),
    })
    await expect.element(page.getByRole('link', { name: 'Nova receita' })).toBeVisible()
    await page.getByRole('link', { name: 'Nova conta fixa' }).click()
    await expect.element(form()).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Pago com/ })).toBeVisible()
  })

  it('opens the form from an empty Previstos too', async () => {
    await openPlanning({
      path: 'planning/occurrences',
      answers: occurrencesAnswer([], {
        toPay: { amountCents: 0, count: 0, overdueCount: 0 },
        toReceive: { amountCents: 0, count: 0, overdueCount: 0 },
        groups: { overdue: 0, upcoming: 0, matched: 0, skipped: 0 },
      }),
    })
    await page.getByRole('link', { name: 'Nova conta fixa' }).click()
    await expect.element(form()).toBeVisible()
  })

  it('gives a viewer no way to create one', async () => {
    await openPlanning({
      path: 'planning/recurrences?recurrence=new',
      access: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })
    await expect.element(page.getByText('Aluguel')).toBeVisible()
    await expect.element(page.getByRole('link', { name: /^Nova/ })).not.toBeInTheDocument()
    await expect.element(form()).not.toBeInTheDocument()
  })
})

describe('PLAN-02 editing a recurrence', () => {
  const RENT = '00000000-0000-4000-8000-0000000008a1'

  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('opens from the row, with the type locked and the rule filled in, and saves it', async () => {
    const sent: unknown[] = []
    await openPlanning({
      answers: {
        [`PATCH ${BASE}/recurrences/${RENT}`]: async (request) => {
          sent.push(await request.json())
          return new Response(null, { status: 204 })
        },
      },
    })
    await page.getByRole('button', { name: /^Aluguel/ }).click()
    await page.getByRole('link', { name: 'Editar' }).click()
    const dialog = page.getByRole('dialog', { name: 'Editar conta fixa' })
    await expect.element(dialog.getByText('O tipo não muda depois de criar.')).toBeVisible()
    await expect.element(dialog.getByRole('textbox', { name: /^Descrição/ })).toHaveValue('Aluguel')
    await expectNoAccessibilityViolations(dialog.element())
    await dialog.getByRole('textbox', { name: /^Valor/ }).fill('2.200,00')
    await dialog.getByRole('button', { name: 'Salvar' }).click()
    await expect.element(page.getByText('Aluguel salva.')).toBeVisible()
    expect(sent).toEqual([
      expect.objectContaining({
        description: 'Aluguel',
        amountCents: 220_000,
        schedule: expect.objectContaining({ frequency: 'monthly', dayOfMonth: 5 }),
      }),
    ])
    expect(sent[0]).not.toHaveProperty('entryType')
  })

  it("warns that an occurrence with its own amount goes back to the rule's", async () => {
    await openPlanning({
      path: `planning/recurrences?recurrence=${RENT}`,
      answers: occurrencesAnswer([
        {
          id: 'own',
          ruleId: RENT,
          description: 'Aluguel',
          entryType: 'expense',
          sourceAccountId: CHECKING,
          categoryAccountId: HOUSE,
          dueOn: '2026-11-05',
          amountCents: 21_437,
          amountIsEstimate: false,
          status: 'pending',
          matchedEntryId: null,
          skippedByUserId: null,
          frequency: 'monthly',
          interval: 1,
          isOverdue: false,
          paidOn: null,
          paidCents: null,
        },
      ]),
    })
    const dialog = page.getByRole('dialog', { name: 'Editar conta fixa' })
    await expect
      .element(
        dialog.getByText(
          /os próximos previstos voltam para o valor desta conta fixa\. Aluguel de 05\/11 tinha valor próprio/,
        ),
      )
      .toBeVisible()
  })

  it('does not let a viewer edit', async () => {
    await openPlanning({
      path: `planning/recurrences?recurrence=${RENT}`,
      access: () => accessAs('Leitor', VIEWER_PERMISSIONS),
    })
    await expect.element(page.getByText('Aluguel')).toBeVisible()
    await expect
      .element(page.getByRole('dialog', { name: 'Editar conta fixa' }))
      .not.toBeInTheDocument()
  })
})
