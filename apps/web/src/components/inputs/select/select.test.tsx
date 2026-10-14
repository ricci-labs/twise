import { Select } from '@web/components/inputs/select/select'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

const METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'cash', label: 'Dinheiro' },
]

function PaymentMethod() {
  const [value, setValue] = useState('')
  return (
    <>
      <label htmlFor="method">Forma de pagamento</label>
      <Select
        id="method"
        title="Forma de pagamento"
        placeholder="Escolha"
        options={METHODS}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </>
  )
}

function sheet() {
  return document.querySelector('[data-slot=sheet], [data-slot=picker-sheet]') as HTMLElement
}

describe('Select', () => {
  afterEach(async () => {
    await page.viewport(414, 896)
  })

  it('opens the app picker on the phone, never the browser list, and shows the choice', async () => {
    await page.viewport(390, 844)
    const screen = await render(<PaymentMethod />)
    const field = screen.getByRole('button', { name: 'Forma de pagamento' })

    await expect.element(field).toHaveTextContent('Escolha')
    expect(document.querySelector('select')).toBeNull()
    await expectNoAccessibilityViolations(screen.container)
    await field.click()

    await expect.element(page.getByRole('dialog', { name: 'Forma de pagamento' })).toBeVisible()
    await expect.poll(() => Math.round(sheet().getBoundingClientRect().bottom)).toBe(844)
    await page.getByRole('button', { name: 'Dinheiro' }).click()

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.element(field).toHaveTextContent('Dinheiro')
  })

  it('opens a menu as wide as the field under it on the desktop, the choice marked', async () => {
    await page.viewport(1440, 900)
    const screen = await render(
      <div className="w-100">
        <PaymentMethod />
      </div>,
    )
    const field = screen.getByRole('button', { name: 'Forma de pagamento' })
    await field.click()
    await page.getByRole('button', { name: 'Pix' }).click()
    await field.click()

    const box = field.element().getBoundingClientRect()
    await expect.poll(() => Math.round(sheet().getBoundingClientRect().width)).toBe(box.width)
    expect(sheet().getBoundingClientRect().top).toBeGreaterThan(box.bottom)
    await expect
      .element(page.getByRole('button', { name: 'Pix' }))
      .toHaveAttribute('aria-current', 'true')
  })
})
