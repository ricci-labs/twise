import { PaceRing } from '@web/components/charts/pace-ring/pace-ring'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('PaceRing', () => {
  it('fills each ring by its share and says both shares in words', async () => {
    const screen = await render(
      <PaceRing
        usedPercent={74}
        elapsedPercent={52}
        centerLabel="74%"
        centerCaption="da renda"
        description="Renda já usada 74%, período passado 52%."
      />,
    )
    const [used, elapsed] = [...screen.container.querySelectorAll('circle[stroke-dasharray]')]
    const share = (arc: Element | undefined) => {
      const [filled = 0, total = 1] = (arc?.getAttribute('stroke-dasharray') ?? '')
        .split(' ')
        .map(Number)
      return Math.round((filled / total) * 100)
    }

    expect(share(used)).toBe(74)
    expect(share(elapsed)).toBe(52)
    await expect.element(screen.getByRole('figure')).toHaveAccessibleName(/Renda já usada 74%/)
    await expectNoAccessibilityViolations(screen.container)
  })
})
