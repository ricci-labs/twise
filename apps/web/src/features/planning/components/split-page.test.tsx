import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { CHECKING, MEMBER_A, SAVINGS } from '@web/testing/accounts-api'
import { entriesListAnswers } from '@web/testing/entries-api'
import {
  accessAs,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { GOALS, goalsAnswer, occurrencesAnswer, RESERVE_GOAL } from '@web/testing/planning-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NONE = { goalId: null, accountId: null, percent: null, amountCents: null }
const STEPS = [
  { ...NONE, position: 1, kind: 'fixed_amount', accountId: SAVINGS, amountCents: 60_000 },
  { ...NONE, position: 2, kind: 'percent', accountId: CHECKING, percent: 20 },
  { ...NONE, position: 3, kind: 'rest', accountId: CHECKING },
]

async function openSplit({
  steps = STEPS,
  goals = GOALS,
  access = workspaceAccess,
  answers = {},
}: {
  steps?: readonly object[]
  goals?: readonly object[]
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
    ...goalsAnswer(goals, steps),
    ...answers,
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/planning/split`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

function steps() {
  return page.getByRole('list', { name: 'Passos da divisão' })
}

function example() {
  return page.getByRole('region', { name: 'Como ficaria' })
}

async function exampleRows(): Promise<string[]> {
  await expect.element(example()).toBeVisible()
  return example()
    .getByRole('listitem')
    .elements()
    .map((row) => row.textContent ?? '')
}

describe('PLAN-06 commission split', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('lists the steps in order and works out the example with another amount', async () => {
    await openSplit()
    await expect.element(steps().getByText('R$ 600,00 para Poupança')).toBeVisible()
    await expect.element(steps().getByText('Valor fixo · a reserva de emergência')).toBeVisible()
    await expect.element(steps().getByText('20% para Conta X')).toBeVisible()
    await expect.element(steps().getByText('O que sobrar para Conta X')).toBeVisible()
    await expect.element(page.getByLabelText('Novo lançamento')).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(page.getByRole('main').element())

    await example().getByRole('radio', { name: 'Outro valor' }).click()
    await example().getByRole('textbox', { name: 'Outro valor' }).fill('1.500,00')
    await expect
      .poll(exampleRows)
      .toEqual([
        expect.stringMatching(/Poupança.*R\$.600,00/),
        expect.stringMatching(/Conta X \(20%\).*R\$.300,00/),
        expect.stringMatching(/o que sobrou.*R\$.600,00/),
        expect.stringMatching(/Sem destino.*R\$.0,00/),
      ])
  })

  it('moves a step down from its menu and saves the new order after asking', async () => {
    const saved: string[] = []
    await openSplit({
      answers: {
        [`PUT ${BASE}/allocation-steps`]: async (request) => {
          saved.push(await request.text())
          return new Response(null, { status: 204 })
        },
      },
    })
    const save = page.getByRole('button', { name: 'Salvar divisão' })
    await expect.element(save).toBeDisabled()
    await page.getByRole('button', { name: 'Ações do passo 1' }).click()
    await expect
      .element(page.getByRole('button', { name: 'Mover para cima' }))
      .not.toBeInTheDocument()
    await page.getByRole('button', { name: 'Mover para baixo' }).click()
    await expect
      .poll(() => steps().getByRole('listitem').first().element().textContent)
      .toContain('20% para Conta X')
    await save.click()
    const dialog = page.getByRole('alertdialog', { name: 'Substituir a divisão atual?' })
    await dialog.getByRole('button', { name: 'Salvar divisão' }).click()
    await expect
      .poll(() => saved)
      .toEqual([
        JSON.stringify({
          steps: [
            { kind: 'percent', accountId: CHECKING, percent: 20 },
            { kind: 'fixed_amount', accountId: SAVINGS, amountCents: 60_000 },
            { kind: 'rest', accountId: CHECKING },
          ],
        }),
      ])
    await expect.element(page.getByText('Divisão salva.')).toBeVisible()
  })

  it('keeps "o que sobrar" last and removes a step at once, with undo', async () => {
    await openSplit()
    await expect.element(steps().getByText('O que sobrar para Conta X')).toBeVisible()
    await page.getByRole('button', { name: 'Ações do passo 3' }).click()
    await expect.element(page.getByRole('button', { name: 'Editar' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'Mover para cima' }))
      .not.toBeInTheDocument()
    await expect
      .element(page.getByRole('button', { name: 'Remover passo' }))
      .not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await page.getByRole('button', { name: 'Ações do passo 2' }).click()
    await expect
      .element(page.getByRole('button', { name: 'Mover para baixo' }))
      .not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await page.getByRole('button', { name: 'Ações do passo 1' }).click()
    await page.getByRole('button', { name: 'Remover passo' }).click()
    await expect.element(steps().getByText('R$ 600,00 para Poupança')).not.toBeInTheDocument()
    await page.getByRole('button', { name: 'Desfazer' }).click()
    await expect.element(steps().getByText('R$ 600,00 para Poupança')).toBeVisible()
  })

  it('adds a percent step before "o que sobrar", showing what it gives with the example', async () => {
    await openSplit()
    await page.getByRole('button', { name: 'Adicionar passo' }).click()
    const sheet = page.getByRole('dialog', { name: 'Adicionar passo' })
    const rest = sheet.getByRole('radio', { name: /O que sobrar para uma conta/ })
    await expect.element(rest).toBeDisabled()
    await expect
      .element(sheet.getByText('Só pode ser o último. Já existe um: Conta X.'))
      .toBeVisible()
    await sheet.getByRole('radio', { name: /Porcentagem para uma conta/ }).click()
    await sheet.getByRole('button', { name: 'Continuar' }).click()
    const fields = page.getByRole('dialog', { name: 'Porcentagem para uma conta' })
    await fields.getByRole('button', { name: /^Para qual conta/ }).click()
    await page.getByRole('button', { name: /^Poupança/ }).click()
    await expect.poll(() => fields.element().textContent).toMatch(/dá R\$.100,00/)
    await fields.getByRole('button', { name: 'Adicionar passo' }).click()
    await expect
      .poll(() => steps().getByRole('listitem').nth(2).element().textContent)
      .toContain('10% para Poupança')
    await expect
      .poll(() => steps().getByRole('listitem').nth(3).element().textContent)
      .toContain('O que sobrar para Conta X')
  })

  it('edits a fixed amount from the step menu', async () => {
    await openSplit()
    await page.getByRole('button', { name: 'Ações do passo 1' }).click()
    await page.getByRole('button', { name: 'Editar' }).click()
    const fields = page.getByRole('dialog', { name: 'Valor fixo para uma conta' })
    await fields.getByLabelText(/^Valor/).fill('700,00')
    await fields.getByRole('button', { name: 'Salvar passo' }).click()
    await expect.element(steps().getByText('R$ 700,00 para Poupança')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Salvar divisão' })).toBeEnabled()
  })

  it('adds "cobrir o orçamento" right away, with no fields to fill', async () => {
    await openSplit()
    await page.getByRole('button', { name: 'Adicionar passo' }).click()
    await page.getByRole('radio', { name: /Cobrir o que passou do orçamento/ }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect.element(steps().getByText('Cobrir o que passou do orçamento')).toBeVisible()
  })

  it('marks a step whose goal was deleted and holds the save until it is removed', async () => {
    await openSplit({
      steps: [
        { ...NONE, position: 1, kind: 'fill_goal', goalId: '00000000-0000-4000-8000-0000000009ff' },
        { ...NONE, position: 2, kind: 'rest', accountId: CHECKING },
      ],
    })
    await expect
      .element(page.getByText('Meta excluída. Remova este passo para salvar.'))
      .toBeVisible()
    await page.getByRole('button', { name: 'Ações do passo 1' }).click()
    await page.getByRole('button', { name: 'Remover passo' }).click()
    await expect.element(page.getByRole('button', { name: 'Salvar divisão' })).toBeEnabled()
  })

  it('starts from the suggestion when there are no steps', async () => {
    await openSplit({ steps: [] })
    await expect.element(page.getByText('Nenhum passo ainda.')).toBeVisible()
    const suggestion = page.getByRole('button', { name: 'Usar a sugestão' })
    const add = page.getByRole('button', { name: 'Adicionar passo' })
    expect(suggestion.element().getBoundingClientRect().width).toBe(
      add.element().getBoundingClientRect().width,
    )
    await suggestion.click()
    await expect.element(steps().getByText('Completar a reserva de emergência')).toBeVisible()
    await expect.element(steps().getByText('O que sobrar para Conta X')).toBeVisible()
    await expect.element(page.getByRole('button', { name: 'Salvar divisão' })).toBeEnabled()
  })

  it('shows a reader the order and the example only', async () => {
    await openSplit({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })
    await expect.element(steps().getByText('20% para Conta X')).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: /Ações do passo/ }))
      .not.toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: /Arrastar/ })).not.toBeInTheDocument()
    await expect
      .element(page.getByRole('button', { name: 'Salvar divisão' }))
      .not.toBeInTheDocument()
  })
})

describe('PLAN-06 on the desktop', () => {
  beforeEach(async () => {
    await page.viewport(1440, 900)
  })

  it('puts the steps in a card with the rules, the example beside it and the save in the header', async () => {
    await openSplit()
    await expect.element(page.getByRole('navigation', { name: 'Caminho' })).toBeVisible()
    const card = page.getByRole('region', { name: 'Passos, nesta ordem' })
    await expect.element(card.getByText(/Porcentagem é sempre da comissão inteira/)).toBeVisible()
    const header = page.getByRole('heading', { name: 'Divisão da comissão', level: 1 })
    const save = page.getByRole('button', { name: 'Salvar divisão' })
    expect(save.element().getBoundingClientRect().top).toBeLessThan(
      card.element().getBoundingClientRect().top,
    )
    await expect.element(header).toBeVisible()
    expect(example().element().getBoundingClientRect().left).toBeGreaterThan(
      card.element().getBoundingClientRect().right,
    )
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('ends the example together with the steps card', async () => {
    await openSplit()
    const card = page.getByRole('region', { name: 'Passos, nesta ordem' })
    await expect.element(card).toBeVisible()

    expect(example().element().getBoundingClientRect().bottom).toBeCloseTo(
      card.element().getBoundingClientRect().bottom,
      0,
    )
  })
})

describe('PLAN-05 split shortcut', () => {
  it('says how many steps there are and where the next commission goes first', async () => {
    fakeApi({
      'GET /api/auth/me': () =>
        Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
      'GET /api/workspaces': () => workspaceList(),
      [`GET ${BASE}`]: workspaceAccess,
      ...entriesListAnswers(),
      ...goalsAnswer(GOALS, [
        { ...NONE, position: 1, kind: 'fill_goal', goalId: RESERVE_GOAL },
        { ...NONE, position: 2, kind: 'rest', accountId: CHECKING },
      ]),
    })
    const app = createApp(
      createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/planning/goals`] }),
    )
    await render(<AppProviders app={app} />)
    const link = page.getByRole('link', { name: /Divisão da comissão/ })
    await expect
      .element(link.getByText('2 passos. A próxima comissão vai primeiro para a reserva.'))
      .toBeVisible()
    await link.click()
    await expect
      .poll(() => app.router.state.location.pathname)
      .toBe(`/w/${WORKSPACE_ID}/planning/split`)
  })
})
