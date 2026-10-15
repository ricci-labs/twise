import { InstallmentRows } from '@web/components/finance/installment-rows/installment-rows'
import type { InstallmentRow } from '@web/components/finance/installment-rows/installment-rows.types'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

function rows(count: number): InstallmentRow[] {
  return Array.from({ length: count }, (_, index) => ({
    key: String(index),
    number: `${index + 1}/${count}`,
    month: `Mês ${index + 1}`,
    due: 'vence 04/11',
    status: { label: 'Futura', tone: 'neutral' },
    amountCents: 30000,
  }))
}

describe('InstallmentRows', () => {
  it('shows three of many from where it is told, and the rest on request', async () => {
    const screen = await render(<InstallmentRows rows={rows(10)} start={1} />)

    await expect.element(screen.getByText('2/10')).toBeVisible()
    await expect.element(screen.getByText('4/10')).toBeVisible()
    await expect.element(screen.getByText('1/10')).not.toBeInTheDocument()
    await screen.getByRole('button', { name: 'Mostrar mais 7 parcelas' }).click()
    await expect.element(screen.getByText('10/10')).toBeVisible()
    await expect.element(screen.getByText('1/10')).toBeVisible()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('shows a few whole, with no button', async () => {
    const screen = await render(<InstallmentRows rows={rows(3)} />)
    await expect.element(screen.getByText('3/3')).toBeVisible()
    await expect.element(screen.getByRole('button')).not.toBeInTheDocument()
  })
})
