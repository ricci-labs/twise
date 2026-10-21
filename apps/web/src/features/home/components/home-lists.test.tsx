import { createMemoryHistory } from '@tanstack/react-router'
import { AppProviders } from '@web/app/providers'
import { createApp } from '@web/app/router'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { DEMO_MEAL_VOUCHER, demoAnswers, demoWithBenefits } from '@web/testing/demo-api'
import {
  accessAs,
  account,
  fakeApi,
  VIEWER_PERMISSIONS,
  WORKSPACE_ID,
  workspaceAccess,
  workspaceList,
} from '@web/testing/fake-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

async function openHome(access = workspaceAccess, answers = demoAnswers()) {
  await page.viewport(1440, 900)
  fakeApi({
    'GET /api/auth/me': account,
    'GET /api/workspaces': () => workspaceList(),
    [`GET /api/workspaces/${WORKSPACE_ID}`]: access,
    ...answers,
  })
  const app = createApp(createMemoryHistory({ initialEntries: [`/w/${WORKSPACE_ID}`] }))
  const screen = await render(<AppProviders app={app} />)
  await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
  return screen
}

describe('HOME-01 lists', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await page.viewport(414, 896)
  })

  it('forecasts each card invoice with the part that belongs to other people', async () => {
    const screen = await openHome()
    const invoices = screen.getByRole('region', { name: 'Próximas faturas' })

    await expect.element(invoices.getByText('Fecha 25/10 · vence 04/11')).toBeVisible()
    await expect.element(invoices.getByText('R$ 1.840 lançado · R$ 110 previsto')).toBeVisible()
    await expect.element(invoices.getByText('R$ 340,00 são de outras pessoas')).toBeVisible()
    await expect.element(invoices.getByText('Tudo de vocês')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts the reserve first, then the goals by deadline', async () => {
    const screen = await openHome()
    const reserve = screen.getByRole('region', { name: 'Reserva e metas' })

    await expect.element(reserve.getByText('Cobre 2,4 meses de gastos')).toBeVisible()
    await expect.element(reserve.getByRole('figure')).toHaveAccessibleName(/Reserva: 67%/)
    await expect.element(reserve.getByText('30% · até dez/26')).toBeVisible()
    await expect.element(reserve.getByText('40% · até mar/27')).toBeVisible()
  })

  it('compares the commission with the average and offers to split it', async () => {
    const screen = await openHome()
    const commissions = screen.getByRole('region', { name: 'Comissões' })

    await expect.element(commissions.getByText('+25% acima da média')).toBeVisible()
    await expect.element(commissions.getByRole('link', { name: 'Dividir' })).toBeVisible()
  })

  it('shows what is left on the meal voucher and whether it lasts to the next credit', async () => {
    const voucher = {
      accountId: DEMO_MEAL_VOUCHER,
      balanceCents: 64_000,
      spentSince: '2026-10-06',
      spentCents: 35_000,
      dailySpendCents: 3500,
      lastsUntil: '2026-11-07',
      nextCredit: { dueOn: '2026-11-06', amountCents: 100_000 },
    }
    const screen = await openHome(workspaceAccess, demoWithBenefits([voucher]))
    const card = screen.getByRole('region', { name: 'VR' })

    await expect.element(card.getByText(/^R\$\s640,00$/)).toBeVisible()
    await expect
      .element(card.getByText(/No ritmo de R\$\s35,00 por dia, dura até o próximo crédito\./))
      .toBeVisible()
    await expect
      .element(card.getByText(/Próximo crédito:\s*R\$\s1\.000,00 em 06\/11/))
      .toBeVisible()
    await expect
      .element(card.getByRole('link', { name: 'Ver lançamentos' }))
      .toHaveAttribute('href', `/w/${WORKSPACE_ID}/entries?accountId=${DEMO_MEAL_VOUCHER}`)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('warns when the meal voucher runs out before the credit, and asks for the credit', async () => {
    const short = {
      accountId: DEMO_MEAL_VOUCHER,
      balanceCents: 10_000,
      spentSince: '2026-10-06',
      spentCents: 70_000,
      dailySpendCents: 7000,
      lastsUntil: '2026-10-21',
    }
    const screen = await openHome(
      workspaceAccess,
      demoWithBenefits([{ ...short, nextCredit: { dueOn: '2026-11-06', amountCents: 100_000 } }]),
    )
    await expect
      .element(screen.getByText(/No ritmo de R\$\s70,00 por dia, dura até 21\/10\./))
      .toBeVisible()
    vi.restoreAllMocks()
    const withoutCredit = await openHome(
      workspaceAccess,
      demoWithBenefits([{ ...short, nextCredit: null }]),
    )
    await expect
      .element(
        withoutCredit.getByText(
          'Cadastre o crédito do mês como receita fixa para ver quando ele entra.',
        ),
      )
      .toBeVisible()
  })

  it('shows no meal voucher card when the household has none', async () => {
    const screen = await openHome()
    await expect
      .element(screen.getByText('Vale-refeição ou vale-alimentação.'))
      .not.toBeInTheDocument()
  })

  it('adds up what contacts owe and names the next one to pay', async () => {
    const screen = await openHome()
    const receivables = screen.getByRole('region', { name: 'A receber de contatos' })

    await expect.element(receivables.getByText('R$ 200,00 em atraso')).toBeVisible()
    await expect.element(receivables.getByText(/Próximo a receber:\s*Member C/)).toBeVisible()
    await expect.element(receivables.getByRole('link', { name: 'Cobrar' })).toBeVisible()
  })

  it('leaves the viewer only the links to look, not to split or charge', async () => {
    const screen = await openHome(() => accessAs('Leitor', VIEWER_PERMISSIONS))
    await expect.element(screen.getByRole('region', { name: 'Comissões' })).toBeVisible()

    await expect.element(screen.getByRole('link', { name: 'Dividir' })).not.toBeInTheDocument()
    await expect.element(screen.getByRole('link', { name: 'Cobrar' })).not.toBeInTheDocument()
    await expect.element(screen.getByRole('link', { name: 'Ver contatos' })).toBeVisible()
  })
})
