import { InvoiceMonthStrip } from '@web/components/finance/invoice-month-strip/invoice-month-strip'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
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
            accessibleLabel: 'Fatura de nov, Aberta, 2026',
            isCurrent: true,
            link: <a href="#nov">nov</a>,
          },
          {
            key: 'jan',
            month: 'jan',
            status: 'Futura',
            accessibleLabel: 'Fatura de jan, Futura, 2027',
            yearBefore: '2027',
            isCurrent: false,
            link: <a href="#jan">jan</a>,
          },
        ]}
      />,
    )

    await expect
      .element(screen.getByRole('link', { name: 'Fatura de nov, Aberta, 2026' }))
      .toHaveAttribute('aria-current', 'true')
    await screen.getByRole('button', { name: 'Todas' }).click()
    expect(onAll).toHaveBeenCalledOnce()
    await expectNoAccessibilityViolations(screen.container)
  })

  it('opens with a whole month at the margin and the month after the open one in view', async () => {
    await page.viewport(390, 844)
    const keys = ['abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const screen = await render(
      <InvoiceMonthStrip
        label="Faturas do Cartão X"
        allLabel="Todas"
        onAll={() => undefined}
        anchor="nov"
        months={keys.map((key) => ({
          key,
          month: key,
          status: 'Paga',
          accessibleLabel: `Fatura de ${key}`,
          isCurrent: key === 'out',
          link: <a href={`#${key}`}>{key}</a>,
        }))}
      />,
    )
    const strip = screen.getByRole('navigation').element() as HTMLElement
    const left = (name: string) =>
      screen
        .getByRole('link', { name: `Fatura de ${name}` })
        .element()
        .getBoundingClientRect()

    await expect.poll(() => strip.scrollLeft).toBeGreaterThan(0)
    const start = strip.getBoundingClientRect().left
    expect(Math.round(left('ago').left - start)).toBe(16)
    expect(left('dez').right).toBeLessThanOrEqual(strip.getBoundingClientRect().right)
  })
})
