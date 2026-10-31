import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { accountsAnswers, CARD, CHECKING } from '@web/testing/accounts-api'
import {
  accessAs,
  account,
  apiError,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import {
  archivedCardAnswer,
  OVER_ON_ACCOUNT,
  simulationAnswer,
  TIGHT_ON_CARD,
} from '@web/testing/purchase-api'
import type { FakeAnswer } from '@web/testing/testing.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const SERVER_ERROR = 500
const BAD_REQUEST = 400
const SIMULATION = `GET /api/workspaces/${WORKSPACE_ID}/simulations/purchase`

async function openPurchase(
  answers: Record<string, FakeAnswer> = simulationAnswer(),
  access: FakeAnswer = workspaceAccess,
) {
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: access,
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
    vi.restoreAllMocks()
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

  it('opens the new entry filled in with the purchase', async () => {
    await openPurchase()

    await typeAmount('3240')
    for (const _ of [1, 2, 3, 4, 5]) {
      await page.getByRole('button', { name: 'Mais parcelas' }).click()
    }
    await page.getByRole('link', { name: 'Registrar esta compra' }).click()

    const dialog = page.getByRole('dialog', { name: 'Novo lançamento' })
    await expect.element(dialog.getByRole('textbox', { name: /Valor/ })).toHaveValue('3.240,00')
    await expect.element(dialog.getByText('6×', { exact: true }).first()).toBeVisible()
    await expect.element(dialog.getByText('Cartão X').first()).toBeVisible()
  })

  it('lets a viewer simulate without "Registrar esta compra"', async () => {
    await openPurchase(simulationAnswer(), () =>
      accessAs('Leitor', [...VIEWER_PERMISSIONS, { module: 'reports', action: 'view' }]),
    )

    await typeAmount('3240')

    await expect.element(page.getByText('Cabe, mas aperta.')).toBeVisible()
    expect(page.getByRole('link', { name: 'Registrar esta compra' }).query()).toBeNull()
  })

  it('stops before asking when the amount cannot be split that many times', async () => {
    const queries: URLSearchParams[] = []
    await openPurchase(simulationAnswer(TIGHT_ON_CARD, queries))

    await typeAmount('3240')
    for (const _ of [1, 2, 3, 4, 5]) {
      await page.getByRole('button', { name: 'Mais parcelas' }).click()
    }
    await expect.element(page.getByText('Cabe, mas aperta.')).toBeVisible()
    const asked = queries.length
    await typeAmount('0,05')

    await expect
      .element(page.getByText('Cada parcela precisa de pelo menos R$ 0,01: use menos parcelas.'))
      .toBeVisible()
    await expect
      .element(page.getByRole('region', { name: 'Quanto custa o que vocês querem comprar?' }))
      .toBeVisible()
    expect(queries).toHaveLength(asked)
  })

  it('puts a card that is no longer valid on the card field', async () => {
    await openPurchase({ [SIMULATION]: () => apiError('SIMULATION_CARD_INVALID', BAD_REQUEST) })

    await typeAmount('100')

    await expect.element(page.getByText('Escolha um cartão ativo.')).toBeVisible()
    expect(page.getByRole('alert').query()).toBeNull()
  })

  it('says it is offline instead of keeping an old result', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    await openPurchase()

    await typeAmount('100')

    const alert = page.getByRole('alert').filter({ hasText: 'Sem conexão' }).last()
    await expect
      .element(
        alert.getByText('O resultado aparece sozinho quando a internet voltar.', { exact: false }),
      )
      .toBeVisible()
    expect(page.getByText('Cabe, mas aperta.').query()).toBeNull()
  })

  it('shows archived cards only on request, and they can be simulated', async () => {
    await openPurchase({
      ...simulationAnswer(),
      ...archivedCardAnswer(),
    })

    await page.getByRole('button', { name: /Cartão X/ }).click()
    const sheet = page.getByRole('dialog', { name: 'Cartão' })
    expect(sheet.getByRole('button', { name: /Cartão antigo/ }).query()).toBeNull()
    await sheet.getByRole('button', { name: /Mostrar arquivados \(1\)/ }).click()
    await sheet.getByRole('button', { name: /Cartão antigo/ }).click()

    await expect.element(page.getByRole('button', { name: /Cartão antigo/ })).toBeVisible()
  })

  it('is a work screen on the desktop: the purchase left, what changes right', async () => {
    await page.viewport(1440, 900)
    await openPurchase()

    await expect
      .element(
        page
          .getByRole('navigation', { name: 'Você está em' })
          .getByRole('link', { name: 'Início' }),
      )
      .toBeVisible()
    const purchase = page.getByRole('region', { name: 'A compra' })
    const changes = page.getByRole('region', { name: 'O que muda' })
    await expect.element(changes.getByText('Atualiza enquanto você digita')).toBeVisible()
    await expect
      .element(changes.getByRole('region', { name: 'Quanto custa o que vocês querem comprar?' }))
      .toBeVisible()

    await userEvent.fill(purchase.getByRole('textbox', { name: 'Valor da compra' }), '3240')

    await expect.element(changes.getByText('Cabe, mas aperta.')).toBeVisible()
    const tiles = changes.element().querySelector('[data-slot=before-after-tiles]') as HTMLElement
    expect(getComputedStyle(tiles).display).toBe('grid')
    expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight)
    await expectNoAccessibilityViolations(page.getByRole('main').element())
  })
})
