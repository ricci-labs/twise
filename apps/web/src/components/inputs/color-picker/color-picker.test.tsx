import { ColorPicker } from '@web/components/inputs/color-picker/color-picker'
import { ACCOUNT_COLORS } from '@web/styles/account-colors'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('ColorPicker', () => {
  it('offers no colour and the palette by name, and picks one', async () => {
    const onSelect = vi.fn()
    const screen = await render(<ColorPicker label="Cor" value="" onSelect={onSelect} />)

    await expect.element(screen.getByRole('radio', { name: 'Sem cor' })).toBeChecked()
    await screen.getByRole('radio', { name: 'Petróleo' }).click()

    expect(onSelect).toHaveBeenCalledWith(ACCOUNT_COLORS[6].value)
    await expectNoAccessibilityViolations(screen.container)
  })
})
