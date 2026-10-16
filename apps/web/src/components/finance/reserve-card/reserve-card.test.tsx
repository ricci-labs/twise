import { ReserveCard } from '@web/components/finance/reserve-card/reserve-card'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const RESERVE = {
  savedCents: 1_200_000,
  targetCents: 1_800_000,
  accountName: 'Poupança',
  percent: 67,
  remainingCents: 600_000,
  overCents: 0,
  coverageMonths: 2.4,
}

describe('ReserveCard', () => {
  it('shows what is saved, where, how many months it covers and what is left', async () => {
    const screen = await render(<ReserveCard reserve={RESERVE} />)
    await expect
      .element(screen.getByRole('heading', { name: 'Reserva de emergência' }))
      .toBeVisible()
    await expect.element(screen.getByText('de R$ 18.000,00 · guardado em Poupança')).toBeVisible()
    await expect.element(screen.getByText('2,4 meses')).toBeVisible()
    await expect.element(screen.getByText('67% · faltam R$ 6.000,00')).toBeVisible()
    await expect.element(screen.getByRole('img', { name: '67% da reserva' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('hides the coverage without history and says when the reserve passed its target', async () => {
    const screen = await render(
      <ReserveCard
        reserve={{
          ...RESERVE,
          coverageMonths: null,
          percent: 100,
          remainingCents: 0,
          overCents: 5000,
        }}
      />,
    )
    await expect.element(screen.getByText(/de gastos/)).not.toBeInTheDocument()
    await expect.element(screen.getByText('100% · passou R$ 50,00')).toBeVisible()
  })

  it('never wraps a 7-digit amount on a 320 px phone', async () => {
    const screen = await render(
      <div className="w-80">
        <ReserveCard reserve={{ ...RESERVE, savedCents: 125_620_000 }} />
      </div>,
    )
    const amount = screen.getByText(/1\.256\.200/).element()
    const lineHeight = Number.parseFloat(getComputedStyle(amount).lineHeight)
    expect(amount.getBoundingClientRect().height).toBeLessThan(lineHeight * 2)
  })

  it('explains the reserve and offers to create one when there is none', async () => {
    const screen = await render(
      <ReserveCard reserve={null} createAction={<button type="button">Criar a reserva</button>} />,
    )
    await expect.element(screen.getByText(/guarda alguns meses de gastos/)).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Criar a reserva' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
