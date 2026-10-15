import { ShowMoreButton } from '@web/components/actions/show-more-button/show-more-button'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ShowMoreButton', () => {
  it('says how many are left and asks for them', async () => {
    const onClick = vi.fn()
    const screen = await render(<ShowMoreButton hiddenCount={45} onClick={onClick} />)

    await screen.getByRole('button', { name: 'Mostrar mais (45)' }).click()
    expect(onClick).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('waits while the next page loads', async () => {
    const screen = await render(<ShowMoreButton isLoading onClick={vi.fn()} />)
    const button = screen.getByRole('button', { name: /Carregando mais/ })

    await expect.element(button).toHaveAttribute('aria-busy', 'true')
    await expect.element(button).toHaveAttribute('aria-disabled', 'true')
  })
})
