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

const MANY_INVOICES = Array.from({ length: 12 }, (_, position) => ({
  value: `invoice-${position + 1}`,
  label: `Vence 04/${String(position + 1).padStart(2, '0')}`,
  detail: 'Falta pagar **R$ 100,00**',
}))

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

  it('shows the oldest 5, then the rest on asking, and searches when there are more than 10', async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <RadioCardList
        label="Fatura"
        options={MANY_INVOICES}
        value="invoice-1"
        onSelect={onSelect}
        searchLabel="Buscar fatura"
      />,
    )

    await expect.element(screen.getByRole('radio', { name: /Vence 04\/05/ })).toBeVisible()
    await expect
      .element(screen.getByRole('radio', { name: /Vence 04\/06/ }))
      .not.toBeInTheDocument()
    await screen.getByRole('button', { name: 'Mostrar mais (7)' }).click()
    await expect.element(screen.getByRole('radio', { name: /Vence 04\/06/ })).toHaveFocus()
    await expect.element(screen.getByRole('radio', { name: /Vence 04\/12/ })).toBeVisible()

    await screen.getByRole('searchbox', { name: 'Buscar fatura' }).fill('04/11')
    await expect.element(screen.getByRole('radio', { name: /Vence 04\/11/ })).toBeVisible()
    await expect
      .element(screen.getByRole('radio', { name: /Vence 04\/01/ }))
      .not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps a short list whole, with no search', async () => {
    const screen = await render(
      <RadioCardList
        label="Fatura"
        options={MANY_INVOICES.slice(0, 5)}
        value={null}
        onSelect={vi.fn()}
        searchLabel="Buscar fatura"
      />,
    )

    await expect.element(screen.getByRole('radio', { name: /Vence 04\/05/ })).toBeVisible()
    await expect.element(screen.getByRole('searchbox')).not.toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: /Mostrar mais/ }))
      .not.toBeInTheDocument()
  })
})
