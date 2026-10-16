import { DateInput } from '@web/components/inputs/date-input/date-input'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('DateInput', () => {
  it('shows the date and picks another in the app calendar', async () => {
    const onChange = vi.fn()
    const screen = await render(
      <>
        <label htmlFor="first">Primeira data</label>
        <DateInput
          id="first"
          title="Primeira data"
          today="2026-10-20"
          value="2026-11-10"
          onChange={onChange}
        />
      </>,
    )
    const field = screen.getByRole('button', { name: 'Primeira data' })
    await expect.element(field).toHaveTextContent('10/11/2026')
    await expectNoAccessibilityViolations(screen.container)

    await field.click()
    const dialog = page.getByRole('dialog', { name: 'Primeira data' })
    await expect.element(dialog.getByText('Novembro de 2026')).toBeVisible()
    await dialog.getByRole('radio', { name: /^12/ }).click()

    expect(onChange).toHaveBeenCalledWith({ target: { value: '2026-11-12' } })
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('asks for a date when there is none', async () => {
    const screen = await render(
      <DateInput
        aria-label="Termina em"
        title="Termina em"
        today="2026-10-20"
        value=""
        onChange={vi.fn()}
      />,
    )
    await expect.element(screen.getByRole('button')).toHaveTextContent('Escolha a data')
  })
})
