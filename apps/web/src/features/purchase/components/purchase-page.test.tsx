import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, CARD, CHECKING } from '@web/testing/accounts-api'
import {
  account,
  apiError,
  fakeApi,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { OVER_ON_ACCOUNT, simulationAnswer, TIGHT_ON_CARD } from '@web/testing/purchase-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SERVER_ERROR = 500
const SIMULATION = `GET /api/workspaces/${WORKSPACE_ID}/simulations/purchase`

async function openPurchase(answers: Record<string, FakeAnswer> = simulationAnswer()) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: workspaceAccess,
    ...accountsAnswers(),
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}/can-i-buy`] }))
  await render(<AppProviders app={app} />)
  return app
}

async function typeAmount(value: string) {
  await userEvent.fill(page.getByRole('textbox', { name: 'Valor da compra' }), value)
}

describe('HOME-02 Posso comprar?', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-20T15:00:00.000Z'))
    await page.viewport(390, 844)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts on the card with one installment today and explains what will appear', async () => {
    await openPurchase()

    await expect.element(page.getByRole('heading', { name: 'Posso comprar?' })).toBeVisible()
    await expect
      .element(page.getByRole('button', { name: 'No cartão' }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect.element(page.getByRole('button', { name: /Cartão X/ })).toBeVisible()
    await expect
      .element(page.getByRole('region', { name: 'Quanto custa o que vocês querem comprar?' }))
      .toBeVisible()
    expect(document.querySelector('[data-slot=floating-action]')).toBeNull()
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('simulates by itself after typing, with the verdict, the blocks, the months and the alerts', async () => {
    const queries: URLSearchParams[] = []
    await openPurchase(simulationAnswer(TIGHT_ON_CARD, queries))

    await typeAmount('3240')
    await page.getByRole('button', { name: 'Mais parcelas' }).click()

    const result = page.getByRole('region', { name: 'O que muda' })
    await expect.element(result.getByText('Cabe, mas aperta.')).toBeVisible()
    await expect
      .element(result.getByText('Dezembro chegaria a 70% da renda fixa comprometida.'))
      .toBeVisible()
    await expect.element(result.getByText('Limite livre do Cartão X')).toBeVisible()
    await expect.element(result.getByText('antes R$ 2.340,00')).toBeVisible()
    await expect
      .element(result.getByRole('img', { name: 'dez/26: 64% para 70% da renda fixa' }))
      .toBeVisible()
    await expect.element(result.getByText(/ficaria com/)).toBeVisible()
    await expect.element(result.getByText('É só uma simulação: nada foi registrado.')).toBeVisible()
    expect(queries).toHaveLength(1)
    expect(Object.fromEntries(queries[0] ?? [])).toEqual({
      amountCents: '324000',
      installmentCount: '2',
      cardAccountId: CARD,
      occurredOn: '2026-10-20',
    })
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })

  it('shows the plan of the installments on the device', async () => {
    await openPurchase()

    await typeAmount('3240')
    for (const _ of [1, 2, 3, 4, 5]) {
      await page.getByRole('button', { name: 'Mais parcelas' }).click()
    }

    await expect.element(page.getByText('6× de R$ 540,00')).toBeVisible()
    await expect
      .element(page.getByText('A 1ª parcela entra na fatura que vence em 04/11.'))
      .toBeVisible()
    await expect.element(page.getByText(/\+ 3 parcelas/)).toBeVisible()
  })

  it('pays from an account, with the balance today and a negative free amount in red', async () => {
    const queries: URLSearchParams[] = []
    await openPurchase(simulationAnswer(OVER_ON_ACCOUNT, queries))

    await page.getByRole('button', { name: 'Na conta' }).click()
    await page.getByRole('button', { name: 'Escolha a conta' }).click()
    await page
      .getByRole('dialog', { name: 'Conta' })
      .getByRole('button', { name: /Conta X/ })
      .click()
    await typeAmount('3260')

    const result = page.getByRole('region', { name: 'O que muda' })
    await expect.element(result.getByText('Não cabe sem estourar.')).toBeVisible()
    await expect.element(result.getByText('Saldo de hoje da Conta X')).toBeVisible()
    expect(result.getByText('-R$ 920,00').element().className).toContain('text-danger')
    await expect.element(result.getByText('Nenhum aviso novo apareceria.')).toBeVisible()
    expect(queries.at(-1)?.get('paidFromAccountId')).toBe(CHECKING)
    expect(queries.at(-1)?.has('cardAccountId')).toBe(false)
  })

  it('replaces the result with the error, its code and a way to try again', async () => {
    await openPurchase({ [SIMULATION]: () => apiError('INTERNAL', SERVER_ERROR) })

    await typeAmount('100')

    const alert = page.getByRole('alert')
    await expect.element(alert.getByText('Não deu para simular agora')).toBeVisible()
    await expect.element(alert.getByText('Código INTERNAL')).toBeVisible()
    await expect.element(alert.getByRole('button', { name: 'Tentar de novo' })).toBeVisible()
  })
})
