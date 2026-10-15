import { SidePanel } from '@web/components/layout/side-panel/side-panel'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('SidePanel', () => {
  it('shows its title, actions and content and closes with the X and with Escape', async () => {
    const onClose = vi.fn()
    await render(
      <SidePanel
        title="Lançamento"
        closeLabel="Fechar"
        onClose={onClose}
        actions={<button type="button">Editar</button>}
      >
        <p>Conteúdo</p>
      </SidePanel>,
    )

    const panel = page.getByRole('dialog', { name: 'Lançamento' })
    await expect.element(panel.getByRole('button', { name: 'Editar' })).toBeVisible()
    await expect.element(panel.getByText('Conteúdo')).toBeVisible()
    await expectNoAccessibilityViolations(panel.element())

    await panel.getByRole('button', { name: 'Fechar' }).click()
    expect(onClose).toHaveBeenCalledOnce()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
