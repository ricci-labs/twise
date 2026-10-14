import { CategoryArt } from '@web/components/display/category-art'
import { PickerField } from '@web/components/inputs/picker-field/picker-field'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('PickerField', () => {
  it('is a button named by its label that opens a dialog, showing the choice and its detail', async () => {
    const onClick = vi.fn()
    const screen = await render(
      <>
        <label htmlFor="paid-from">Pago com</label>
        <PickerField
          id="paid-from"
          value="Conta X"
          detail="Saldo de hoje: R$ 4.200,00"
          art={<CategoryArt name="Conta X" icon="wallet" />}
          placeholder="Escolha uma conta"
          onClick={onClick}
        />
      </>,
    )
    const field = screen.getByRole('button', { name: /Pago com/ })

    await expect.element(field).toHaveAttribute('aria-haspopup', 'dialog')
    await expect.element(field).toHaveTextContent('Conta XSaldo de hoje: R$ 4.200,00')
    await field.click()
    expect(onClick).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows a subcategory with its parent', async () => {
    const screen = await render(
      <>
        <label htmlFor="category">Categoria</label>
        <PickerField id="category" value="Feira" parentLabel="Mercado" placeholder="Escolha" />
      </>,
    )
    await expect
      .element(screen.getByRole('button', { name: /Categoria/ }))
      .toHaveTextContent('Mercado›Feira')
  })

  it('shows the placeholder when nothing is chosen, and the error state', async () => {
    const screen = await render(
      <>
        <label htmlFor="category">Categoria</label>
        <PickerField id="category" value={null} aria-invalid placeholder="Escolha uma categoria" />
      </>,
    )
    const field = screen.getByRole('button', { name: /Categoria/ })

    await expect.element(field).toHaveTextContent('Escolha uma categoria')
    await expect.element(field).toHaveAttribute('aria-invalid', 'true')
    await expectNoAccessibilityViolations(screen.container)
  })
})
