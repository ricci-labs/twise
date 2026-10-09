import { HelpPopover } from '@web/components/display/help-popover/help-popover'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('HelpPopover', () => {
  it('explains a number in plain words and closes with Escape', async () => {
    const screen = await render(
      <HelpPopover topic="Livre para gastar">
        Renda fixa do período, menos o que já foi gasto.
      </HelpPopover>,
    )
    const trigger = screen.getByRole('button', { name: 'O que é Livre para gastar?' })

    await trigger.click()
    await expect
      .element(screen.getByText('Renda fixa do período, menos o que já foi gasto.'))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.getByRole('dialog').element())
    await userEvent.keyboard('{Escape}')
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
  })
})
