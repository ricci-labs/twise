import { MomentSheet } from '@web/components/feedback/moment-sheet/moment-sheet'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

function renderMoment() {
  const handlers = { onOpenChange: vi.fn(), onAction: vi.fn() }
  const screen = render(
    <MomentSheet
      art="wallet"
      title="Conta Z criada"
      text="Quanto tem nela hoje?"
      actionLabel="Informar saldo inicial"
      dismissLabel="Agora não"
      isOpen
      {...handlers}
    />,
  )
  return { screen, ...handlers }
}

describe('MomentSheet', () => {
  it('names the moment, says what to do next and offers to leave it for later', async () => {
    const { screen, onAction, onOpenChange } = renderMoment()
    const view = await screen
    const sheet = view.getByRole('dialog', { name: 'Conta Z criada' })

    await expect.element(sheet).toBeVisible()
    await expect.element(view.getByText('Quanto tem nela hoje?')).toBeVisible()
    await expectNoAccessibilityViolations(sheet.element())
    await view.getByRole('button', { name: 'Informar saldo inicial' }).click()
    expect(onAction).toHaveBeenCalledOnce()
    await view.getByRole('button', { name: 'Agora não' }).click()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
