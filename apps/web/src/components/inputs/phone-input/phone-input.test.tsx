import { PhoneInput } from '@web/components/inputs/phone-input/phone-input'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

function Field({ onBlur }: { onBlur?: () => void }) {
  const [callingCode, setCallingCode] = useState('+55')
  const [number, setNumber] = useState('')
  return (
    <>
      <label htmlFor="phone">WhatsApp</label>
      <PhoneInput
        id="phone"
        callingCode={callingCode}
        onCallingCodeChange={setCallingCode}
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        onBlur={onBlur}
      />
    </>
  )
}

describe('PhoneInput', () => {
  it('opens the phone keyboard and writes a Brazilian number with its area code on blur', async () => {
    const onBlur = vi.fn()
    const screen = await render(<Field onBlur={onBlur} />)
    const input = screen.getByLabelText('WhatsApp')

    await expect.element(input).toHaveAttribute('inputmode', 'tel')
    await expect.element(input).toHaveAttribute('placeholder', '(11) 99999-0000')
    await input.fill('11999990000')
    await userEvent.tab()

    await expect.element(input).toHaveValue('(11) 99999-0000')
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('chooses another country from the list and leaves its number as typed', async () => {
    const screen = await render(<Field />)

    await screen.getByRole('button', { name: 'País: +55' }).click()
    await page.getByRole('button', { name: 'Portugal (+351)' }).click()
    await expect
      .element(screen.getByRole('button', { name: 'País: +351' }))
      .toHaveTextContent('+351')
    const input = screen.getByLabelText('WhatsApp')
    await input.fill('912345678')
    await userEvent.tab()

    await expect.element(input).toHaveValue('912345678')
    await expect.element(input).not.toHaveAttribute('placeholder')
  })

  it('has no accessibility violations', async () => {
    const screen = await render(<Field />)

    await expectNoAccessibilityViolations(screen.container)
  })
})
