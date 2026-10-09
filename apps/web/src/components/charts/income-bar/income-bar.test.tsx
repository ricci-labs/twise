import { IncomeBar } from '@web/components/charts/income-bar/income-bar'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('IncomeBar', () => {
  it('lists every part with its share and amount, and draws only the parts that exist', async () => {
    const screen = await render(
      <IncomeBar
        segments={[
          {
            key: 'spent',
            tone: 'spent',
            label: 'Gasto',
            percent: 95,
            percentLabel: '95%',
            amountLabel: 'R$ 8.590,00',
          },
          {
            key: 'committed',
            tone: 'committed',
            label: 'Comprometido',
            percent: 0,
            percentLabel: '0%',
            amountLabel: 'R$ 0,00',
          },
          {
            key: 'free',
            tone: 'free',
            label: 'Livre',
            percent: 5,
            percentLabel: '5%',
            amountLabel: 'R$ 410,00',
          },
        ]}
      />,
    )

    await expect.element(screen.getByText('Comprometido')).toBeVisible()
    await expect.element(screen.getByText('R$ 410,00')).toBeVisible()
    expect(screen.container.querySelectorAll('rect')).toHaveLength(2)
    await expectNoAccessibilityViolations(screen.container)
  })
})
