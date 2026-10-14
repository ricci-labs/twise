import { Select } from '@web/components/inputs/select/select'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Select', () => {
  it('is a native select named by its label, with an empty first choice when asked', async () => {
    const onChange = vi.fn()
    const screen = await render(
      <>
        <label htmlFor="method">Forma de pagamento</label>
        <Select
          id="method"
          placeholder="Escolha"
          options={[
            { value: 'pix', label: 'Pix' },
            { value: 'cash', label: 'Dinheiro' },
          ]}
          defaultValue=""
          onChange={onChange}
        />
      </>,
    )
    const select = screen.getByRole('combobox', { name: 'Forma de pagamento' })

    await expect.element(select).toHaveValue('')
    await select.selectOptions('cash')
    expect(onChange).toHaveBeenCalledOnce()
    await expect.element(select).toHaveValue('cash')
    await expectNoAccessibilityViolations(screen.container)
  })
})
