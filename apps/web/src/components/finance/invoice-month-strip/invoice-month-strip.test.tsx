import { InvoiceMonthStrip } from '@web/components/finance/invoice-month-strip/invoice-month-strip'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

describe('InvoiceMonthStrip', () => {
  it('links each month by its due month and status, marks the chosen one and opens all', async () => {
    const onAll = vi.fn()
    const screen = await render(
      <InvoiceMonthStrip
        label="Faturas do Cartão X"
        allLabel="Todas"
        onAll={onAll}
        months={[
          {
            key: 'nov',
            month: 'nov',
            status: 'Aberta',
            accessibleLabel: 'Fatura de nov de 2026, Aberta',
            isCurrent: true,
            link: <a href="#nov">nov</a>,
          },
          {
            key: 'jan',
            month: 'jan',
            status: 'Futura',
            accessibleLabel: 'Fatura de jan de 2027, Futura',
            yearBefore: '2027',
            isCurrent: false,
            link: <a href="#jan">jan</a>,
          },
        ]}
      />,
    )

    await expect
      .element(screen.getByRole('link', { name: 'Fatura de nov de 2026, Aberta' }))
      .toHaveAttribute('aria-current', 'true')
    await screen.getByRole('button', { name: 'Todas' }).click()
    expect(onAll).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })
})
