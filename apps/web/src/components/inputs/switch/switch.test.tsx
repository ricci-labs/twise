import { Switch } from '@web/components/inputs/switch/switch'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Switch', () => {
  it('is a switch named by the label beside it, turned by the label too', async () => {
    const onCheckedChange = vi.fn()
    const screen = await render(
      <Switch label="Compra já em andamento" isChecked={false} onCheckedChange={onCheckedChange} />,
    )
    const control = screen.getByRole('switch', { name: 'Compra já em andamento' })

    await expect.element(control).not.toBeChecked()
    await screen.getByText('Compra já em andamento').click()
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('puts the help under the label and describes the switch with it', async () => {
    const screen = await render(
      <Switch
        label="O valor muda todo mês (aproximado)"
        help="Ex.: a conta de luz."
        isChecked={false}
        onCheckedChange={vi.fn()}
      />,
    )
    await expect
      .element(screen.getByRole('switch', { name: 'O valor muda todo mês (aproximado)' }))
      .toHaveAccessibleDescription('Ex.: a conta de luz.')
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows when it is on', async () => {
    const screen = await render(
      <Switch label="Negativo (cheque especial)" isChecked onCheckedChange={vi.fn()} />,
    )
    await expect
      .element(screen.getByRole('switch', { name: 'Negativo (cheque especial)' }))
      .toBeChecked()
  })
})
