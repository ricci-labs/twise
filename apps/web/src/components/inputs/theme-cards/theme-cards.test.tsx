import { ThemeCards } from '@web/components/inputs/theme-cards/theme-cards'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ThemeCards', () => {
  it('offers light, dark and automatic, the chosen one checked', async () => {
    const onChange = vi.fn()
    const screen = await render(<ThemeCards label="Tema" value="light" onChange={onChange} />)
    const group = screen.getByRole('radiogroup', { name: 'Tema' })

    await expect
      .element(group.getByRole('radio', { name: 'Claro' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect.element(group.getByText('Segue o aparelho')).toBeVisible()
    await group.getByRole('radio', { name: 'Escuro' }).click()
    expect(onChange).toHaveBeenCalledWith('dark')
    await expectNoAccessibilityViolations(screen.container)
  })
})
