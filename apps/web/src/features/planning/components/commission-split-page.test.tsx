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
import {
  budgetOverview,
  GOALS,
  goalsAnswer,
  overviewAnswer,
  RESERVE_GOAL,
} from '@web/testing/planning-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { beforeEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NONE = { goalId: null, accountId: null, percent: null, amountCents: null }
const STEPS = [
  { ...NONE, position: 1, kind: 'fill_goal', goalId: RESERVE_GOAL },
  { ...NONE, position: 2, kind: 'cover_overspent' },
  { ...NONE, position: 3, kind: 'rest', accountId: CHECKING },
]

function overview() {
  const base = budgetOverview()
  return {
    ...base,
    insights: [
      {
        code: 'variable_income_to_split',
        severity: 'info',
        subject: '2026-10',
        values: { amountCents: 90_000 },
      },
    ],
    metrics: {
      ...base.metrics,
      variableIncome: 150_000,
      variableAverage: null,
      freeToSpend: -6_000,
    },
  }
}

async function openSplit({
  steps = STEPS,
  access = workspaceAccess,
  path = 'commission-split',
}: {
  steps?: readonly object[]
  access?: FakeAnswer
  path?: string
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...entriesListAnswers(),
    ...goalsAnswer(GOALS, steps),
    ...overviewAnswer(overview()),
    [`GET ${BASE}/allocation/suggestion`]: () =>
      Response.json({
        parts: [
          { position: 1, kind: 'fill_goal', toAccountId: SAVINGS, amountCents: 60_000 },
          { position: 2, kind: 'cover_overspent', toAccountId: null, amountCents: 6_000 },
          { position: 3, kind: 'rest', toAccountId: CHECKING, amountCents: 84_000 },
        ],
        leftoverCents: 0,
      }),
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/${path}`] }))
  await render(<AppProviders app={app} />)
  return app
}

function parts() {
  return page.getByRole('region', { name: 'Partes da comissão' })
}

describe('HOME-03 commission split', () => {
  beforeEach(async () => {
    await page.viewport(360, 800)
    localStorage.clear()
  })

  it('applies the split rule to this commission, part by part', async () => {
    await openSplit()
    await expect.element(parts().getByText(/Ainda há/)).toBeVisible()
    await expect.element(parts().getByText('Poupança (reserva)')).toBeVisible()
    await expect.element(parts().getByText('Para Poupança')).toBeVisible()
    await expect.element(parts().getByText('Cobrir o orçamento')).toBeVisible()
    expect(parts().getByText('Fica na conta').elements()).toHaveLength(2)
    await expect
      .element(page.getByRole('textbox', { name: 'Valor da comissão' }))
      .toHaveValue('1.500,00')
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('transfers a part from the account where the commission landed and marks it done', async () => {
    const app = await openSplit()
    await page.getByRole('link', { name: 'Transferir a parte de Poupança (reserva)' }).click()
    await expect
      .poll(() => app.router.state.location.search)
      .toMatchObject({
        entry: 'new',
        entryType: 'transfer',
        entryAccount: CHECKING,
        entryToAccount: SAVINGS,
        entryAmount: 60_000,
        entrySplitPart: 1,
        entrySplitLabel: 'Poupança (reserva)',
      })
    await app.router.navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        entry: undefined,
        entryType: undefined,
        entryAccount: undefined,
        entryToAccount: undefined,
        entryAmount: undefined,
        entrySplitPart: undefined,
        entrySplitLabel: undefined,
        splitDone: 1,
      }),
    })
    await expect.element(parts().getByText('Feito')).toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Transferir a parte de Poupança (reserva)' }))
      .not.toBeInTheDocument()
  })

  it('starts from the amount of the income it was opened from', async () => {
    await openSplit({ path: 'commission-split?amount=200000' })
    await expect
      .element(page.getByRole('textbox', { name: 'Valor da comissão' }))
      .toHaveValue('2.000,00')
  })

  it('sends to the split rules when there are none yet', async () => {
    await openSplit({ steps: [] })
    await expect
      .element(page.getByText('Você ainda não definiu como dividir a comissão.'))
      .toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Definir divisão' })).toBeVisible()
  })

  it('shows a reader the suggestion without "Transferir"', async () => {
    await openSplit({ access: () => accessAs('Leitor', VIEWER_PERMISSIONS) })
    await expect.element(parts().getByText('Poupança (reserva)')).toBeVisible()
    await expect.element(page.getByRole('link', { name: /Transferir/ })).not.toBeInTheDocument()
  })
})
