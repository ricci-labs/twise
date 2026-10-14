import { Breadcrumb } from '@web/components/navigation/breadcrumb/breadcrumb'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Breadcrumb', () => {
  it('links the levels above and marks the current page', async () => {
    const screen = await render(
      <Breadcrumb
        label="Caminho"
        items={[{ label: 'Cartões', link: <a href="#cartoes">Cartões</a> }, { label: 'Cartão X' }]}
      />,
    )

    await expect
      .element(
        screen.getByRole('navigation', { name: 'Caminho' }).getByRole('link', { name: 'Cartões' }),
      )
      .toHaveAttribute('href', '#cartoes')
    await expect.element(screen.getByText('Cartão X')).toHaveAttribute('aria-current', 'page')
    await expectNoAccessibilityViolations(screen.container)
  })
})
