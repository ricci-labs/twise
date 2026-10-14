import { IllustrationPicker } from '@web/components/inputs/illustration-picker/illustration-picker'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('IllustrationPicker', () => {
  it('offers the initial first, then the thirteen drawings, and picks one', async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <IllustrationPicker label="Ilustração" name="Conta Z" value="" onSelect={onSelect} />,
    )
    const group = screen.getByRole('radiogroup', { name: 'Ilustração' })

    await expect
      .element(screen.getByRole('radio', { name: 'Sem ilustração: a inicial' }))
      .toBeChecked()
    await expect.element(screen.getByText('C')).toBeVisible()
    expect(group.element().querySelectorAll('[role=radio]')).toHaveLength(14)
    await screen.getByRole('radio', { name: 'Cofrinho' }).click()
    expect(onSelect).toHaveBeenCalledWith('piggy-bank')
    await expectNoAccessibilityViolations(screen.container)
  })
})
