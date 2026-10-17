import { InvoiceSummary } from '@web/components/finance/invoice-summary/invoice-summary'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('InvoiceSummary', () => {
  it('names the invoice, its status and how it splits between the household and others', async () => {
    const screen = await render(
      <InvoiceSummary
        title="Fatura de novembro"
        status={{ label: 'Aberta', tone: 'warning' }}
        dates="Fecha 25/10 · vence 04/11"
        totalCents={195000}
        paid={{ label: 'Pago', cents: 0 }}
        due={{ label: 'Falta pagar', cents: 195000 }}
        own={{ label: 'Seu', cents: 171000 }}
        fronted={{ label: 'De terceiros', cents: 24000 }}
        splitLabel="Seu R$ 1.710,00, de terceiros R$ 240,00"
      />,
    )
    const summary = screen.getByRole('region', { name: 'Fatura de novembro' })

    await expect.element(summary.getByText('Aberta')).toBeVisible()
    await expect
      .element(summary.getByRole('img', { name: 'Seu R$ 1.710,00, de terceiros R$ 240,00' }))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('keeps 7-digit amounts on one line inside the card, even on a 320 px phone', async () => {
    const screen = await render(
      <div className="w-72">
        <InvoiceSummary
          title="Fatura de novembro"
          status={{ label: 'Aberta', tone: 'warning' }}
          dates="Fecha 25/10 · vence 04/11"
          totalCents={251304000}
          paid={{ label: 'Pago', cents: 125652000 }}
          due={{ label: 'Falta pagar', cents: 125652000 }}
          own={{ label: 'Seu', cents: 251304000 }}
          fronted={{ label: 'De terceiros', cents: 0 }}
          splitLabel="Seu R$ 2.513.040,00"
        />
      </div>,
    )
    const card = screen.getByRole('region', { name: 'Fatura de novembro' }).element()
    const contentRight =
      card.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(card).paddingRight)
    for (const fact of ['Pago', 'Falta pagar']) {
      const value = screen.getByText(fact, { exact: true }).element().nextElementSibling
      const amount = value?.firstElementChild?.getBoundingClientRect()
      expect(amount?.height).toBeLessThan(30)
      expect(amount?.right).toBeLessThanOrEqual(value?.getBoundingClientRect().right ?? 0)
      expect(value?.parentElement?.getBoundingClientRect().right).toBeLessThanOrEqual(contentRight)
    }
  })
})
