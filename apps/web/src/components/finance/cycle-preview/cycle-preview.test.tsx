import { CyclePreview } from '@web/components/finance/cycle-preview/cycle-preview'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('CyclePreview', () => {
  it('says where a purchase today lands, the date in bold', async () => {
    const screen = await render(
      <CyclePreview text="Uma compra hoje entra na fatura que vence em **04/11**." />,
    )

    await expect.element(screen.getByText('04/11')).toHaveClass('font-bold')
    await expectNoAccessibilityViolations(screen.container)
  })
})
