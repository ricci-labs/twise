import { InvoiceFacts } from '@web/components/finance/invoice-facts/invoice-facts'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('InvoiceFacts', () => {
  it('pairs each label with its value', async () => {
    const screen = await render(
      <InvoiceFacts label="Resumo da fatura" facts={[{ label: 'Total', value: 'R$ 1.950,00' }]} />,
    )

    await expect.element(screen.getByRole('term')).toHaveTextContent('Total')
    await expect.element(screen.getByRole('definition')).toHaveTextContent('R$ 1.950,00')
    await expectNoAccessibilityViolations(screen.container)
  })
})
