import { GoalCard } from '@web/components/finance/goal-card/goal-card'
import type { GoalCardProps } from '@web/components/finance/goal-card/goal-card.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const TRIP: GoalCardProps = {
  name: 'Viagem para o Chile',
  art: { name: 'Conta Viagem', icon: 'travel' },
  accountName: 'Conta Viagem',
  savedCents: 480_000,
  targetCents: 1_500_000,
  percent: 32,
  remainingCents: 1_020_000,
  overCents: 0,
  deadlineLabel: 'jul/27',
  monthlyToTargetCents: 113_400,
}

async function renderGoal(props: Partial<GoalCardProps> = {}, width = 'w-90') {
  return render(
    <ul className={width}>
      <GoalCard {...TRIP} {...props} />
    </ul>,
  )
}

describe('GoalCard', () => {
  it('shows saved of target, the percent and deadline, what is left and the monthly amount', async () => {
    const screen = await renderGoal()
    await expect.element(screen.getByRole('heading', { name: 'Viagem para o Chile' })).toBeVisible()
    await expect.element(screen.getByText('Guardado em Conta Viagem')).toBeVisible()
    await expect.element(screen.getByText('R$ 4.800,00')).toBeVisible()
    await expect.element(screen.getByText('de R$ 15.000,00')).toBeVisible()
    await expect.element(screen.getByText('32% · até jul/27')).toBeVisible()
    await expect.element(screen.getByText('faltam R$ 10.200,00')).toBeVisible()
    await expect.element(screen.getByText('R$ 1.134,00 por mês')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says "sem prazo" and leaves out the monthly amount without a deadline', async () => {
    const screen = await renderGoal({ deadlineLabel: null, monthlyToTargetCents: null })
    await expect.element(screen.getByText('32% · sem prazo')).toBeVisible()
    await expect.element(screen.getByText(/por mês/)).not.toBeInTheDocument()
  })

  it('marks a reached goal first in its second line, with what passed and the hint', async () => {
    const screen = await renderGoal({
      savedCents: 620_000,
      targetCents: 600_000,
      percent: 100,
      remainingCents: 0,
      overCents: 20_000,
    })
    const badge = screen.getByText('Meta atingida').element()
    const account = screen.getByText('Guardado em Conta Viagem').element()
    expect(badge.getBoundingClientRect().top).toBeLessThanOrEqual(
      account.getBoundingClientRect().top + 4,
    )
    expect(badge.compareDocumentPosition(account) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await expect.element(screen.getByText('Passou R$ 200,00')).toBeVisible()
    await expect.element(screen.getByText(/Chegou lá/)).toBeVisible()
    await expect.element(screen.getByText(/por mês/)).not.toBeInTheDocument()
  })

  it('keeps long names to two lines and moves "de R$ Y" whole to the next line', async () => {
    const screen = await renderGoal(
      {
        name: 'Investimento para a troca do carro da família em 2027 com sobra para o seguro',
        savedCents: 125_620_000,
        targetCents: 400_000_000,
      },
      'w-72',
    )
    const name = screen.getByRole('heading').element()
    const lineHeight = Number.parseFloat(getComputedStyle(name).lineHeight)
    expect(name.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight * 2 + 1)
    const saved = screen.getByText('R$ 1.256.200,00').element().getBoundingClientRect()
    const target = screen.getByText('de R$ 4.000.000,00').element().getBoundingClientRect()
    expect(saved.height).toBeLessThan(30)
    expect(target.height).toBeLessThan(24)
  })
})
