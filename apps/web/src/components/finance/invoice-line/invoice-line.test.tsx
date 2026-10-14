import { InvoiceLine } from '@web/components/finance/invoice-line/invoice-line'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
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
})
