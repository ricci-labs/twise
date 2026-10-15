import { AttachArea } from '@web/components/finance/attach-area/attach-area'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('AttachArea', () => {
  it('asks for a photo or PDF', async () => {
    const onPress = vi.fn()
    const screen = await render(<AttachArea onPress={onPress} />)

    await screen.getByRole('button', { name: /Anexar comprovante/ }).click()
    expect(onPress).toHaveBeenCalledOnce()
    await expect.element(screen.getByText('Foto ou PDF')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
