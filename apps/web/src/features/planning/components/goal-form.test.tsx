import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { CHECKING, MEMBER_A } from '@web/testing/accounts-api'
import { entriesListAnswers } from '@web/testing/entries-api'
import {
  apiError,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import {
  GOALS,
  goalsAnswer,
  occurrencesAnswer,
  RESERVE_GOAL,
  recurrenceFormAnswers,
  TRIP_GOAL,
} from '@web/testing/planning-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`

async function openGoals(path: string, answers: Record<string, FakeAnswer> = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: workspaceAccess,
    ...entriesListAnswers(),
    ...occurrencesAnswer(),
    ...recurrenceFormAnswers(),
    ...goalsAnswer(),
    [`GET ${BASE}/goals/preview`]: () =>
      Response.json({ savedCents: 480_000, monthlyToTargetCents: 113_400 }),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/${path}`] }))
  await render(<AppProviders app={app} />)
  return app
}

function form(name = 'Nova meta') {
  return page.getByRole('dialog', { name })
}

describe('PLAN-05 goal form', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
  })

  it('locks the reserve switch and dims the accounts other goals already use', async () => {
    await openGoals('planning/goals')
    await page.getByRole('link', { name: 'Nova meta' }).click()
    await expect.element(form()).toBeVisible()
    await expect.element(form().getByText(/O progresso é o saldo da conta escolhida/)).toBeVisible()
    await expect
      .element(form().getByRole('switch', { name: /reserva de emergência/ }))
      .toBeDisabled()
    await expect
      .element(form().getByText('Já existe uma: a de Poupança. Só pode haver uma.'))
      .toBeVisible()
    await expectNoAccessibilityViolations(form().element())
    await page.getByRole('button', { name: /^Guardado em/ }).click()
    await expect.element(page.getByRole('button', { name: /Poupança/ })).toBeDisabled()
    await expect.element(page.getByText('É da Reserva de emergência')).toBeVisible()
    await expect.element(page.getByRole('button', { name: /^Conta X/ })).toBeDisabled()
    await expect.element(page.getByText('É da meta Viagem para o Chile')).toBeVisible()
  })

  it('creates a goal without a deadline', async () => {
    const posted: unknown[] = []
    const app = await openGoals('planning/goals?goal=new', {
      ...goalsAnswer(GOALS.slice(0, 1)),
      [`POST ${BASE}/goals`]: async (request) => {
        posted.push(await request.json())
        return Response.json({ goalId: TRIP_GOAL }, { status: 201 })
      },
    })
    await page.getByLabelText(/^Nome da meta/).fill('Notebook novo')
    await page.getByLabelText(/^Valor da meta/).fill('5.000,00')
    await page.getByRole('button', { name: /^Guardado em/ }).click()
    await page.getByRole('button', { name: /^Conta X/ }).click()
    await page.getByRole('button', { name: 'Criar meta' }).click()

    await expect
      .poll(() => posted)
      .toEqual([
        {
          name: 'Notebook novo',
          targetCents: 500_000,
          accountId: CHECKING,
          targetOn: null,
          isReserve: false,
        },
      ])
    await expect.element(page.getByText('Meta criada.')).toBeVisible()
    await expect.poll(() => app.router.state.location.search).not.toHaveProperty('goal')
  })

  it('opens "Criar a reserva" with the reserve switch on', async () => {
    await openGoals('planning/goals', goalsAnswer([]))
    await page.getByRole('link', { name: 'Criar a reserva' }).click()
    const reserve = form().getByRole('switch', { name: /reserva de emergência/ })
    await expect.element(reserve).toBeChecked()
    await expect.element(reserve).toBeEnabled()
  })

  it('edits a goal, previews the monthly amount and shows a taken account on its field', async () => {
    await openGoals(`planning/goals?goal=${TRIP_GOAL}`, {
      [`PATCH ${BASE}/goals/${TRIP_GOAL}`]: () => apiError('GOAL_ACCOUNT_TAKEN', 409),
    })
    await expect.element(form('Editar meta')).toBeVisible()
    await expect.element(page.getByLabelText(/^Nome da meta/)).toHaveValue('Viagem para o Chile')
    await expect.element(form('Editar meta').getByText('R$ 1.134,00 por mês')).toBeVisible()
    await page.getByLabelText(/^Nome da meta/).fill('Viagem para o Chile e a Argentina')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect.element(page.getByText('Essa conta já é de outra meta.')).toBeVisible()
  })

  it('asks for a new account and comes back with it chosen', async () => {
    const created = '00000000-0000-4000-8000-0000000000c7'
    const app = await openGoals(`planning/goals?goal=new`)
    await page.getByRole('button', { name: /^Guardado em/ }).click()
    await page.getByRole('button', { name: /Criar uma conta para a meta/ }).click()
    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({ goal: 'new', account: 'new', accountFor: 'form' })
    await app.router.navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        account: undefined,
        accountFor: undefined,
        createdAccount: created,
      }),
    })
    await expect.poll(() => app.router.state.location.search).not.toHaveProperty('createdAccount')
  })

  it('leaves the reserve switch free while editing the reserve itself', async () => {
    await openGoals(`planning/goals?goal=${RESERVE_GOAL}`)
    await expect
      .element(form('Editar meta').getByRole('switch', { name: /reserva de emergência/ }))
      .toBeEnabled()
  })
})
