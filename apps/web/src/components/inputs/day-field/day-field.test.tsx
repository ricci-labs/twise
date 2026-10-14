import { DayField } from '@web/components/inputs/day-field/day-field'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('DayField', () => {
  it('opens the 31 days, marks the chosen one and closes on a tap', async () => {
    const onChange = vi.fn()
    const screen = await render(
      <DayField
        aria-label="Dia do fechamento"
        title="Dia do fechamento"
        summary={(day) => `Fecha todo dia **${day}**`}
        value="25"
        onChange={onChange}
      />,
    )

    await expect
      .element(screen.getByRole('button', { name: 'Dia do fechamento' }))
      .toHaveTextContent('Dia 25')
    await screen.getByRole('button', { name: 'Dia do fechamento' }).click()

    const days = page.getByRole('radiogroup', { name: 'Dia do fechamento' })
    await expect
      .element(days.getByRole('radio', { name: '25' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect.element(page.getByText('Fecha todo dia 25')).toBeVisible()
    await expect
      .element(page.getByText('29, 30 e 31: nos meses mais curtos, vale o último dia do mês.'))
      .toBeVisible()
    await expectNoAccessibilityViolations(page.getByRole('dialog').element())

    await days.getByRole('radio', { name: '4', exact: true }).click()

    expect(onChange).toHaveBeenCalledWith({ target: { value: '4' } })
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('asks for a day when there is none', async () => {
    const screen = await render(
      <DayField
        aria-label="Dia do vencimento"
        title="Dia do vencimento"
        summary={(day) => `Vence todo dia **${day}**`}
        value=""
        onChange={() => undefined}
      />,
    )

    await expect.element(screen.getByRole('button')).toHaveTextContent('Escolha')
  })
})
