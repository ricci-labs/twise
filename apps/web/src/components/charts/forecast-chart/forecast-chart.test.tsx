import { ForecastChart } from '@web/components/charts/forecast-chart/forecast-chart'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const POINTS = [
  { key: 'a', label: '20 out', cents: 400_000 },
  { key: 'b', label: '1 nov', cents: -20_000 },
  { key: 'c', label: '5 nov', cents: 380_000 },
]

describe('ForecastChart', () => {
  it('draws the forecast for the eye and says it in words for screen readers', async () => {
    const screen = await render(
      <div className="w-160">
        <ForecastChart
          points={POINTS}
          lowestKey="b"
          lowestLabel="−R$ 200,00 · 1 nov · menor saldo do período"
          description="Conta X: hoje R$ 4.000,00, menor saldo −R$ 200,00 em 1 nov."
          formatAxis={(cents) => `${cents / 100}`}
        />
      </div>,
    )

    await expect
      .element(screen.getByText('−R$ 200,00 · 1 nov · menor saldo do período'))
      .toBeVisible()
    await expect
      .element(screen.getByRole('figure'))
      .toHaveAccessibleName(/menor saldo −R\$ 200,00 em 1 nov/)
    await expect
      .poll(() => screen.container.querySelectorAll('.recharts-area-curve').length)
      .toBe(1)
    await expectNoAccessibilityViolations(screen.container)
  })
})
