import { SegmentedControl } from '@web/components/actions/segmented-control/segmented-control'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('SegmentedControl', () => {
  it('marks the chosen option as pressed and tells when another is picked', async () => {
    const onValueChange = vi.fn()
    const screen = await render(
      <SegmentedControl
        label="Conta"
        options={[
          { value: 'x', label: 'Conta X' },
          { value: 'y', label: 'Conta Y' },
        ]}
        value="x"
        onValueChange={onValueChange}
      />,
    )

    await expect
      .element(screen.getByRole('button', { name: 'Conta X' }))
      .toHaveAttribute('aria-pressed', 'true')
    await screen.getByRole('button', { name: 'Conta Y' }).click()
    expect(onValueChange).toHaveBeenCalledWith('y')
    await expectNoAccessibilityViolations(screen.container)
  })
})
