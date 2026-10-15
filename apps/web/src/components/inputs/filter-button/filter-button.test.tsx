import { FilterButton } from '@web/components/inputs/filter-button/filter-button'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('FilterButton', () => {
  it('reads its label alone while no filter is on', async () => {
    const screen = await render(<FilterButton label="Categoria" />)

    const button = screen.getByRole('button', { name: 'Categoria' })
    await expect.element(button).not.toHaveAttribute('data-active')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows the chosen value and the outline of a filter that is on', async () => {
    const screen = await render(<FilterButton label="Tipo" value="Compra no cartão" />)

    await expect
      .element(screen.getByRole('button', { name: 'Tipo: Compra no cartão' }))
      .toHaveAttribute('data-active')
  })
})
