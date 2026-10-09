import { Amount } from '@web/components/display/amount'
import { KpiBadge, KpiCard } from '@web/components/display/kpi-card/kpi-card'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('KpiCard', () => {
  it('reads as the label, the value and its lines, in that order', async () => {
    const screen = await render(
      <main>
        <KpiCard
          tone="mint"
          label="Livre para gastar"
          value={<Amount cents={234_000} size="kpi" isCentsRaised />}
          badge={<KpiBadge tone="onMint">R$ 146,25 por dia</KpiBadge>}
        >
          <p>Até 4 nov · faltam 16 dias</p>
        </KpiCard>
      </main>,
    )

    await expect.element(screen.getByRole('heading', { name: 'Livre para gastar' })).toBeVisible()
    expect(screen.container.textContent).toBe(
      'Livre para gastarR$ 2.340,00R$ 146,25 por diaAté 4 nov · faltam 16 dias',
    )
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows a value past the plan in red on the soft danger card', async () => {
    const screen = await render(
      <main>
        <KpiCard
          tone="danger"
          label="Livre para gastar"
          value={<Amount cents={-38_000} size="kpi" />}
        />
      </main>,
    )

    await expect.element(screen.getByText('−R$ 380,00')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
