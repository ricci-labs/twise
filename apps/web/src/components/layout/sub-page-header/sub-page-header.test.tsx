import { SubPageHeader } from '@web/components/layout/sub-page-header/sub-page-header'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('SubPageHeader', () => {
  it('titles the page and names the way back', async () => {
    const screen = await render(
      <SubPageHeader
        back={<a href="#contas" />}
        backLabel="Voltar para Contas"
        title="Lixeira de contas"
        description="Contas, cartões e categorias excluídos."
      />,
    )

    await expect.element(screen.getByRole('heading', { name: 'Lixeira de contas' })).toBeVisible()
    await expect
      .element(screen.getByRole('link', { name: 'Voltar para Contas' }))
      .toHaveAttribute('href', '#contas')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts the page actions on the right', async () => {
    const screen = await render(
      <SubPageHeader
        back={<a href="#cartoes" />}
        backLabel="Voltar para Cartões"
        title="Cartão X"
        actions={<button type="button">Ações de Cartão X</button>}
      />,
    )

    await expect.element(screen.getByRole('button', { name: 'Ações de Cartão X' })).toBeVisible()
  })
})
