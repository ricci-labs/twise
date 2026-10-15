import { InvoiceLine } from '@web/components/finance/invoice-line/invoice-line'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { expectClampedToTwoLines, expectWholeAmount, LONG_TEXT } from '@web/testing/long-text'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('InvoiceLine', () => {
  it('shows a line of the statement with its installment and a payment as negative', async () => {
    const screen = await render(
      <ul>
        <InvoiceLine
          date="22/10"
          description="Tênis de corrida"
          icon="leisure"
          installment="1/3"
          amountCents={33334}
        />
        <InvoiceLine
          date="03/10"
          description="Pagamento"
          detail="Com a Conta X"
          icon="invoice-paid"
          amountCents={-162000}
          isPayment
        />
      </ul>,
    )

    await expect.element(screen.getByText('1/3')).toBeVisible()
    await expect.element(screen.getByText('−R$ 1.620,00')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('cuts a long description and detail at two lines and keeps the amount whole', async () => {
    const screen = await render(
      <ul className="w-80">
        <InvoiceLine
          date="20/10"
          description={LONG_TEXT.description}
          icon="house"
          installment="10/12"
          detail={`R$ 1.000.000,00 de terceiros · ${LONG_TEXT.person} · ${LONG_TEXT.account}`}
          amountCents={LONG_TEXT.amountCents}
        />
      </ul>,
    )
    const row = screen.container.querySelector('[data-slot=invoice-line]') as HTMLElement

    expectClampedToTwoLines(screen.getByText(LONG_TEXT.description).element())
    expectClampedToTwoLines(screen.getByText(LONG_TEXT.person, { exact: false }).element())
    expectWholeAmount(row.querySelector('[data-slot=amount]') as HTMLElement, row)
  })
})
