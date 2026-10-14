import { RadioCardList } from '@web/components/inputs/radio-card-list/radio-card-list'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const INVOICES = [
  {
    value: 'nov',
    label: 'Vence 04/11',
    detail: 'Falta pagar **R$ 1.950,00**',
    badge: { label: 'Aberta', tone: 'warning' },
  },
  { value: 'dec', label: 'Vence 04/12', detail: 'Falta pagar **R$ 640,00**' },
] as const

describe('RadioCardList', () => {
  it('lists the options as radios with their detail and status, and tells the pick', async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <RadioCardList label="Fatura" options={INVOICES} value="nov" onSelect={onSelect} />,
    )

    await expect.element(screen.getByRole('radiogroup', { name: 'Fatura' })).toBeVisible()
    await expect.element(screen.getByRole('radio', { name: /Vence 04\/11/ })).toBeChecked()
    await expect.element(screen.getByText('Aberta')).toBeVisible()
    await screen.getByRole('radio', { name: /Vence 04\/12/ }).click()
    expect(onSelect).toHaveBeenCalledWith('dec')
    await expectNoAccessibilityViolations(screen.container)
  })
})
