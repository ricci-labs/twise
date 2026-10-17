import { ListSection } from '@web/components/display/list-section/list-section'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ListSection', () => {
  it('is a region named by its title, with the aside read in the heading', async () => {
    const screen = await render(
      <ListSection title="Cobranças" aside="2">
        <p>Cobrança de 20/10</p>
      </ListSection>,
    )

    await expect
      .element(screen.getByRole('heading', { name: 'Cobranças 2', level: 2 }))
      .toBeVisible()
    await expect.element(screen.getByRole('region', { name: 'Cobranças 2' })).toBeVisible()
    await expect.element(screen.getByText('Cobrança de 20/10')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('says why it is empty instead of its content', async () => {
    const screen = await render(
      <ListSection title="Em aberto" empty="Nada em aberto.">
        <p>Mercado</p>
      </ListSection>,
    )

    await expect.element(screen.getByText('Nada em aberto.')).toBeVisible()
    await expect.element(screen.getByText('Mercado')).not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })
})
