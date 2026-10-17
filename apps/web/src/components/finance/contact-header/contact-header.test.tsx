import { ContactHeader } from '@web/components/finance/contact-header/contact-header'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function amountText(container: HTMLElement) {
  return container.querySelector('[data-slot=amount]')?.textContent?.replace(/\s/g, ' ')
}

describe('ContactHeader', () => {
  it('names the contact under "Contato", with "Deve", the amount and the sentence', async () => {
    const screen = await render(<ContactHeader name="Member D" owedCents={52000} hasUpcoming />)
    await expect.element(screen.getByRole('heading', { name: 'Member D' })).toBeVisible()
    await expect.element(screen.getByText('Contato', { exact: true })).toBeVisible()
    await expect.element(screen.getByText('Deve', { exact: true })).toBeVisible()
    expect(amountText(screen.container)).toBe('R$ 520,00')
    await expect
      .element(screen.getByText('deve no total, contando as parcelas que ainda vão vencer'))
      .toBeVisible()
    await expect
      .element(screen.getByText('Pediu para não receber mensagens'))
      .not.toBeInTheDocument()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows the opt-out pill when the contact asked for no messages', async () => {
    const screen = await render(<ContactHeader name="Member E" owedCents={20000} isOptedOut />)
    await expect.element(screen.getByText('Pediu para não receber mensagens')).toBeVisible()
    await expect.element(screen.getByText('deve no total', { exact: true })).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows a credit as "Crédito de" in mint, with no sign', async () => {
    const owes = await render(<ContactHeader name="Member D" owedCents={3000} />)
    const owesColor = getComputedStyle(
      owes.container.querySelector('[data-slot=amount]') as HTMLElement,
    ).color
    const screen = await render(<ContactHeader name="Member F" owedCents={-3000} />)
    await expect.element(screen.getByText('Crédito de')).toBeVisible()
    expect(amountText(screen.container)).toBe('R$ 30,00')
    const amount = screen.container.querySelector('[data-slot=amount]') as HTMLElement
    expect(getComputedStyle(amount).color).not.toBe(owesColor)
    await expect
      .element(screen.getByText('pagou a mais: fica de crédito para as próximas'))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps R$ 1.256.520,00 on one line inside the card at 360 px', async () => {
    const screen = await render(
      <div className="w-90 px-4">
        <ContactHeader
          name="Maria Aparecida dos Santos Oliveira"
          owedCents={125652000}
          hasUpcoming
          isOptedOut
        />
      </div>,
    )
    const amount = screen.container.querySelector('[data-slot=amount]') as HTMLElement
    const card = screen.container.querySelector('[data-slot=contact-header]') as HTMLElement
    const lineHeight = Number.parseFloat(getComputedStyle(amount).lineHeight)
    expect(amount.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5)
    expect(amount.getBoundingClientRect().right).toBeLessThanOrEqual(
      card.getBoundingClientRect().right,
    )
    expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)
  })
})
