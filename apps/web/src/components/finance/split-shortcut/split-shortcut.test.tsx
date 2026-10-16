import { SplitShortcut } from '@web/components/finance/split-shortcut/split-shortcut'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const TEXT = '4 passos. A próxima comissão vai primeiro para a reserva.'

describe('SplitShortcut', () => {
  it('is one link to the split, with "Editar divisão" for who can edit', async () => {
    const screen = await render(<SplitShortcut text={TEXT} link={<a href="#divisao" />} canEdit />)
    const link = screen.getByRole('link', { name: /Divisão da comissão/ })
    await expect.element(link).toHaveAttribute('href', '#divisao')
    expect(link.element().textContent).toContain(TEXT)
    expect(link.element().textContent).toContain('Editar divisão')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('still opens the split for a viewer, without "Editar divisão"', async () => {
    const screen = await render(
      <SplitShortcut text={TEXT} link={<a href="#divisao" />} canEdit={false} />,
    )
    await expect.element(screen.getByRole('link', { name: /Divisão da comissão/ })).toBeVisible()
    await expect.element(screen.getByText('Editar divisão')).not.toBeInTheDocument()
  })
})
