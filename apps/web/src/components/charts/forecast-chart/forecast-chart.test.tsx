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
          lowestCallout={{ amount: '−R$ 200,00', detail: '1 nov · menor saldo do período' }}
          description="Conta X: hoje R$ 4.000,00, menor saldo −R$ 200,00 em 1 nov."
          formatAxis={(cents) => `${cents / 100}`}
        />
      </div>,
    )

    await expect.element(screen.getByText('1 nov · menor saldo do período')).toBeVisible()
    await expect.element(screen.getByText('−R$ 200,00', { exact: true })).toBeVisible()
    expect(
      screen.container.querySelectorAll('.recharts-cartesian-grid-horizontal line').length,
    ).toBeGreaterThan(0)
    await expect
      .element(screen.getByRole('figure'))
      .toHaveAccessibleName(/menor saldo −R\$ 200,00 em 1 nov/)
    await expect
      .poll(() => screen.container.querySelectorAll('.recharts-area-curve').length)
      .toBe(1)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('draws a forecast that never goes negative in the forecast colour only', async () => {
    const screen = await render(
      <div className="w-160">
        <ForecastChart
          points={[
            { key: 'a', label: '20 out', cents: 400_000 },
            { key: 'b', label: '4 nov', cents: 41_000 },
            { key: 'c', label: '5 nov', cents: 391_000 },
          ]}
          lowestKey="b"
          lowestCallout={{ amount: 'R$ 410,00', detail: '4 nov · menor saldo do período' }}
          description="Conta X."
          formatAxis={(cents) => `${cents / 100}`}
        />
      </div>,
    )

    await expect.poll(() => screen.container.querySelector('.recharts-area-curve')).not.toBeNull()
    expect(screen.container.querySelector('.recharts-area-curve')?.getAttribute('stroke')).toBe(
      'var(--color-mint-ink)',
    )
  })
})
