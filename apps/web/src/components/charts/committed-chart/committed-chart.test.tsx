import { CommittedChart } from '@web/components/charts/committed-chart/committed-chart'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('CommittedChart', () => {
  it('stacks installments and bills per month, with the legend and a text alternative', async () => {
    const screen = await render(
      <div className="w-160">
        <CommittedChart
          months={[
            {
              key: 'a',
              label: 'nov/26',
              installmentsPercent: 9,
              plannedPercent: 43,
              percentLabel: '52%',
              isHigh: false,
            },
            {
              key: 'b',
              label: 'jan/27',
              installmentsPercent: 9,
              plannedPercent: 63,
              percentLabel: '72%',
              isHigh: true,
            },
          ]}
          limitPercent={70}
          limitLabel="70% da renda fixa"
          installmentsLabel="Parcelas"
          plannedLabel="Contas previstas"
          description="Janeiro já tem 72% da renda fixa comprometida."
        />
      </div>,
    )

    await expect
      .element(screen.getByRole('figure'))
      .toHaveAccessibleName('Janeiro já tem 72% da renda fixa comprometida.')
    await expect.element(screen.getByText('Parcelas')).toBeVisible()
    await expect
      .poll(() => screen.container.querySelectorAll('.recharts-bar-rectangle').length)
      .toBe(4)
    await expectNoAccessibilityViolations(screen.container)
  })
})
