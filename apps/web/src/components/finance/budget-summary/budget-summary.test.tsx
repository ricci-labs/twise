import { BudgetSummary } from '@web/components/finance/budget-summary/budget-summary'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('BudgetSummary', () => {
  it('shows the spending of the sum of limits, the pace mark and its legend', async () => {
    const screen = await render(
      <div className="w-82">
        <BudgetSummary
          title="Gasto nas categorias com orçamento"
          spentCents={123456789}
          limitCents={987654321}
          markPercent={52}
          legend="onde o gasto deveria estar hoje (dia 16 de 31)"
        />
      </div>,
    )
    await expect
      .element(screen.getByRole('region', { name: 'Gasto nas categorias com orçamento' }))
      .toBeVisible()
    await expect.element(screen.getByText(/dia 16 de 31/)).toBeVisible()
    const spent = screen.getByText('R$ 1.234.567,89').element()
    const box = screen.getByRole('region').element()
    expect(spent.getBoundingClientRect().right).toBeLessThanOrEqual(
      box.getBoundingClientRect().right,
    )
    await expectNoAccessibilityViolations(screen.container)
  })
})
