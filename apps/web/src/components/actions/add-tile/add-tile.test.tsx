import { AddTile } from '@web/components/actions/add-tile/add-tile'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('AddTile', () => {
  it('is a link named by its title and text', async () => {
    const screen = await render(
      <AddTile
        title="Novo cartão"
        text="Cadastre com os dias de fechamento e vencimento."
        link={<a href="#novo">Novo cartão</a>}
      />,
    )

    await expect
      .element(screen.getByRole('link', { name: /^Novo cartão Cadastre com os dias/ }))
      .toHaveAttribute('href', '#novo')
    await expectNoAccessibilityViolations(screen.container)
  })
})
