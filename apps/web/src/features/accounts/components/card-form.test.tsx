import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, CARD, CHECKING, MEMBER_A } from '@web/testing/accounts-api'
import {
  accessAs,
  apiError,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const BASE = `/api/workspaces/${WORKSPACE_ID}`
const NEW_CARD = '00000000-0000-4000-8000-0000000000c8'
const GREY = ACCOUNT_COLORS.find((color) => color.key === 'grey')?.value

async function openCards({
  access = workspaceAccess,
  answers = {},
  path = '',
}: {
  access?: FakeAnswer
  answers?: Record<string, FakeAnswer>
  path?: string
} = {}) {
  fakeApi({
    'GET /api/auth/me': () =>
      Response.json({ userId: MEMBER_A, email: 'member.a@exemplo.com', displayName: 'Member A' }),
    'GET /api/workspaces': () => workspaceList(),
    [`GET ${BASE}`]: access,
    ...accountsAnswers(answers),
  })
  const app = createApp(
    createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/cards${path}`] }),
  )
  await render(<AppProviders app={app} />)
  return app
}

async function chooseDay(field: string, day: string) {
  await page.getByRole('button', { name: field }).click()
  await page
    .getByRole('radiogroup', { name: field })
    .getByRole('radio', { name: day, exact: true })
    .click()
}

describe('CARD-04 card form', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('creates a card with its cycle, previewing where a purchase today lands', async () => {
    const sent: unknown[] = []
    const app = await openCards({
      answers: {
        [`POST ${BASE}/cards`]: async (request) => {
          sent.push(await request.json())
          return Response.json({ accountId: NEW_CARD }, { status: 201 })
        },
      },
    })

    await page.getByRole('link', { name: 'Novo cartão' }).click()
    await expect.element(page.getByRole('dialog', { name: 'Novo cartão' })).toBeVisible()
    await expect.element(page.getByLabelText(/^Nome do cartão/)).toHaveFocus()
    await page.getByLabelText(/^Nome do cartão/).fill('Cartão Z')
    await chooseDay('Dia do fechamento', '25')
    await chooseDay('Dia do vencimento', '4')

    await expect
      .element(page.getByText(/Compras até dia 25 entram na fatura que vence dia 4/))
      .toBeVisible()
    await expect.element(page.getByText('04/11')).toBeVisible()
    await page.getByLabelText('Limite').fill('5.000,00')
    await expectNoAccessibilityViolations(
      page.getByRole('dialog', { name: 'Novo cartão' }).element(),
    )
    await page.getByRole('button', { name: 'Criar cartão' }).click()

    await expect.element(page.getByText('Cartão Z criado.')).toBeVisible()
    expect(sent).toEqual([
      {
        name: 'Cartão Z',
        closingDay: 25,
        dueDay: 4,
        purchaseOnClosingDayGoesNext: true,
        limitCents: 500000,
        holderUserId: MEMBER_A,
        paymentAccountId: CHECKING,
        color: GREY,
      },
    ])
    expect(app.router.state.location.search).toEqual({})
  })

  it('warns that past invoices keep their dates and sends only the cycle that changed', async () => {
    const sent: unknown[] = []
    await openCards({
      path: `?card=${CARD}`,
      answers: {
        [`PATCH ${BASE}/cards/${CARD}`]: async (request) => {
          sent.push(await request.json())
          return new Response(null, { status: 204 })
        },
      },
    })
    await expect.element(page.getByRole('dialog', { name: 'Editar cartão' })).toBeVisible()

    await chooseDay('Dia do vencimento', '5')

    await expect
      .element(
        page.getByText(
          'Faturas já criadas mantêm as datas atuais; a mudança vale para as próximas.',
        ),
      )
      .toBeVisible()
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect.element(page.getByText('Alterações salvas.')).toBeVisible()
    expect(sent).toEqual([{ dueDay: 5 }])
  })

  it('points at the payment account the API refuses', async () => {
    await openCards({
      path: `?card=${CARD}`,
      answers: {
        [`PATCH ${BASE}/cards/${CARD}`]: () => apiError('PAYMENT_ACCOUNT_NOT_AVAILABLE', 400),
      },
    })

    await page.getByRole('radio', { name: 'Member A' }).click()
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect.element(page.getByText('Escolha uma conta ativa de dinheiro.')).toBeVisible()
    await expect
      .element(page.getByLabelText('Conta que paga a fatura'))
      .toHaveAttribute('aria-invalid', 'true')
  })

  it('lets a member change only the cycle', async () => {
    await openCards({
      path: `?card=${CARD}`,
      access: () =>
        accessAs('Membro', [
          { module: 'cards', action: 'view' },
          { module: 'cards', action: 'update' },
          { module: 'accounts', action: 'view' },
          { module: 'members', action: 'view' },
        ]),
    })

    await expect.element(page.getByRole('dialog', { name: 'Editar cartão' })).toBeVisible()
    await expect.element(page.getByLabelText(/^Nome do cartão/)).not.toBeInTheDocument()
    await expect.element(page.getByRole('radiogroup', { name: 'Cor' })).not.toBeInTheDocument()
    await expect.element(page.getByRole('radio', { name: 'Member B' })).toBeChecked()
  })
})
