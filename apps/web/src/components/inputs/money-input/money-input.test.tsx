import { MoneyInput } from '@web/components/inputs/money-input/money-input'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function Field({ initial = '', isNegative = false }: { initial?: string; isNegative?: boolean }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <label htmlFor="amount">Valor</label>
      <MoneyInput
        id="amount"
        size="lg"
        isNegative={isNegative}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </>
  )
}

describe('MoneyInput', () => {
  it('opens the decimal keyboard and tidies a valid amount when leaving the field', async () => {
    const screen = await render(<Field />)
    const input = screen.getByLabelText('Valor')

    await expect.element(input).toHaveAttribute('inputmode', 'decimal')
    await expect.element(input).toHaveAttribute('placeholder', '0,00')
    await input.fill('1234,5')
    await userEvent.tab()
    await expect.element(input).toHaveValue('1.234,50')
  })

  it('keeps what was typed when it is not an amount, so the form can say what is wrong', async () => {
    const screen = await render(<Field />)
    const input = screen.getByLabelText('Valor')

    await input.fill('12,3,4')
    await userEvent.tab()
    await expect.element(input).toHaveValue('12,3,4')
  })

  it('tells the form when it leaves the field, after tidying', async () => {
    const onBlur = vi.fn()
    const onChange = vi.fn()
    const screen = await render(
      <>
        <label htmlFor="share">Parte</label>
        <MoneyInput id="share" size="sm" value="80" onChange={onChange} onBlur={onBlur} />
      </>,
    )

    await screen.getByLabelText('Parte').click()
    await userEvent.tab()
    expect(onChange).toHaveBeenCalledWith({ target: { value: '80,00' } })
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('shows the minus sign for a negative balance', async () => {
    const screen = await render(<Field initial="1.200,00" isNegative />)
    await expect.element(screen.getByText('−')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })
})
