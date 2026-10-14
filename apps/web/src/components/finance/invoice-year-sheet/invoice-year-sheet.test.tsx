import { InvoiceYearSheet } from '@web/components/finance/invoice-year-sheet/invoice-year-sheet'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-react'

describe('InvoiceYearSheet', () => {
  it('shows the months of a year with their status and moves between years', async () => {
    const onPrevious = vi.fn()
    await render(
      <InvoiceYearSheet
        title="Faturas do Cartão X"
        year="2026"
        isOpen
        onOpenChange={() => undefined}
        onPrevious={onPrevious}
        note="Cada fatura leva o mês em que vence."
        months={[
          {
            key: 'nov',
            month: 'nov',
            status: { label: 'Aberta', tone: 'warning' },
            total: 'R$ 1.950,00',
            isCurrent: true,
            link: <a href="#nov">nov</a>,
          },
        ]}
      />,
    )
    const sheet = page.getByRole('dialog', { name: 'Faturas do Cartão X' })

    await expect
      .element(sheet.getByRole('link', { name: /nov/ }))
      .toHaveAttribute('aria-current', 'true')
    await expect.element(sheet.getByRole('button', { name: 'Próximo ano' })).toBeDisabled()
    await sheet.getByRole('button', { name: 'Ano anterior' }).click()
    expect(onPrevious).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(sheet.element())
  })
})
