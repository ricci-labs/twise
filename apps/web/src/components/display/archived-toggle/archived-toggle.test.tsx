import { ArchivedToggle } from '@web/components/display/archived-toggle/archived-toggle'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ArchivedToggle', () => {
  it('keeps the archived items closed until asked', async () => {
    const screen = await render(
      <ArchivedToggle count={2}>
        <p>Conta antiga</p>
      </ArchivedToggle>,
    )
    const toggle = screen.getByRole('button', { name: 'Arquivadas (2)' })

    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect.element(screen.getByText('Conta antiga')).not.toBeInTheDocument()
    await toggle.click()
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect.element(screen.getByText('Conta antiga')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('is not there when nothing is archived', async () => {
    const screen = await render(
      <ArchivedToggle count={0}>
        <p>Nada</p>
      </ArchivedToggle>,
    )
    expect(screen.container.querySelector('[data-slot=archived-toggle]')).toBeNull()
  })
})
