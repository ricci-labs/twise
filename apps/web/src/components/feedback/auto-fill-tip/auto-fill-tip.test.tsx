import { AutoFillTip } from '@web/components/feedback/auto-fill-tip/auto-fill-tip'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('AutoFillTip', () => {
  it('says what was filled and undoes it', async () => {
    const onUndo = vi.fn()
    const screen = await render(
      <AutoFillTip text="Preenchemos a categoria como da última vez." onUndo={onUndo} />,
    )

    await expect
      .element(screen.getByText('Preenchemos a categoria como da última vez.'))
      .toBeVisible()
    await screen.getByRole('button', { name: 'Desfazer' }).click()
    expect(onUndo).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })
})
