import { Card } from '@web/components/display/card/card'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Card', () => {
  it('is a region named by its title, with the footer only when given', async () => {
    const screen = await render(
      <main>
        <Card title="Avisos" description="Os mais urgentes primeiro.">
          <p>Tudo em ordem por aqui.</p>
        </Card>
      </main>,
    )

    await expect.element(screen.getByRole('region', { name: 'Avisos' })).toBeVisible()
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Avisos' })).toBeVisible()
    expect(screen.container.querySelector('[data-slot=card-foot]')).toBeNull()
    await expectNoAccessibilityViolations(screen.container)
  })
})
