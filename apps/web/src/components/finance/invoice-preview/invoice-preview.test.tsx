import { InvoicePreview } from '@web/components/finance/invoice-preview/invoice-preview'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('InvoicePreview', () => {
  it('says where the first installment goes and lists each one, announced as it changes', async () => {
    const screen = await render(
      <InvoicePreview
        title="A 1ª parcela entra na fatura que vence em **04/11**."
        rows={[
          { key: '1', number: '1/2', due: 'vence 04/11', amountCents: 5001, isClosed: false },
          { key: '2', number: '2/2', due: 'vence 04/12', amountCents: 5000, isClosed: false },
        ]}
        more="+ 1 parcela, até a fatura que vence em 04/01/27"
      />,
    )
    await expect.element(screen.getByRole('status')).toBeVisible()
    const text = screen.getByRole('status').element().textContent ?? ''

    expect(text).toContain('entra na fatura que vence em 04/11.')
    expect(text).toMatch(/1\/2vence 04\/11R\$\s50,01/)
    expect(text).toMatch(/2\/2vence 04\/12R\$\s50,00/)
    await expect
      .element(screen.getByText('+ 1 parcela, até a fatura que vence em 04/01/27'))
      .toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('marks an installment that would land on a closed invoice', async () => {
    const screen = await render(
      <InvoicePreview
        title="A 1ª parcela cairia na fatura que vence em **04/10**."
        rows={[{ key: '1', number: '1/1', due: 'vence 04/10', amountCents: 9000, isClosed: true }]}
      />,
    )
    await expect.element(screen.getByText('Fechada')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows only the sentence when it is paid at once', async () => {
    const screen = await render(
      <InvoicePreview
        title="Entra na fatura que vence em **04/11**."
        rows={[{ key: '1', number: '1/1', due: 'vence 04/11', amountCents: 9000, isClosed: false }]}
      />,
    )
    await expect.element(screen.getByRole('list')).not.toBeInTheDocument()
  })
})
