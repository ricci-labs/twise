import { Button } from '@web/components/actions/button'
import { Sheet } from '@web/components/layout/sheet/sheet'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('Sheet', () => {
  it('opens a titled dialog from the bottom and closes with Escape', async () => {
    const screen = await render(
      <Sheet title="Mais" trigger={<Button variant="outline">Mais</Button>}>
        <p>Contatos e cobranças</p>
      </Sheet>,
    )
    await screen.getByRole('button', { name: 'Mais' }).click()

    await expect.element(screen.getByRole('dialog', { name: 'Mais' })).toBeVisible()
    await expect.element(screen.getByText('Contatos e cobranças')).toBeVisible()
    await expectNoAccessibilityViolations(screen.getByRole('dialog', { name: 'Mais' }).element())

    await userEvent.keyboard('{Escape}')
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
  })
})
