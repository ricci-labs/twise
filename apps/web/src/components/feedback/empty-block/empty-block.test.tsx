import { EmptyBlock } from '@web/components/feedback/empty-block/empty-block'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('EmptyBlock', () => {
  it('says what is missing, why, and offers the first step', async () => {
    const screen = await render(
      <EmptyBlock
        icon="wallet"
        title="Nenhuma conta ainda."
        text="Comece pela sua conta corrente. Depois, os cartões."
        action={<button type="button">Nova conta</button>}
      />,
    )
    await expect.element(screen.getByText('Nenhuma conta ainda.')).toBeVisible()
    await expect
      .element(screen.getByText('Comece pela sua conta corrente. Depois, os cartões.'))
      .toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Nova conta' })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
