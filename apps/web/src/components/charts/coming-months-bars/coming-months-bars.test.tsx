import { ComingMonthsBars } from '@web/components/charts/coming-months-bars/coming-months-bars'
import { expectNoAccessibilityViolations } from '@web/testing/accessibility'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

const MONTHS = [
  { key: 'dez', label: 'dez/26', beforePercent: 64, afterPercent: 70 },
  { key: 'abr', label: 'abr/27', beforePercent: 22, afterPercent: 22 },
  { key: 'nov', label: 'nov/26', beforePercent: 58, afterPercent: 412 },
]

describe('ComingMonthsBars', () => {
  it('reads each month before and after, and only the changed ones are strong', async () => {
    const screen = await render(<ComingMonthsBars months={MONTHS} referencePercent={70} />)

    await expect
      .element(screen.getByRole('img', { name: 'dez/26: 64% para 70% da renda fixa' }))
      .toBeVisible()
    await expect
      .element(screen.getByRole('img', { name: 'abr/27: 22% da renda fixa, sem mudança' }))
      .toBeVisible()
    const rows = screen.container.querySelectorAll('li[data-changed]')
    expect(rows).toHaveLength(2)
    expect(screen.container.querySelectorAll('[data-slot=coming-month-purchase]')).toHaveLength(2)
    await expectNoAccessibilityViolations(screen.container)
  })

  it('stops a bar above 100% at the end with the overflow mark', async () => {
    const screen = await render(<ComingMonthsBars months={MONTHS} referencePercent={70} />)

    const over = screen.getByRole('img', { name: /nov\/26/ })
    expect(over.element().querySelector('[aria-label="passa de 100%"]')).not.toBeNull()
    const purchase = over.element().querySelector('[data-slot=coming-month-purchase]')
    expect(Number.parseFloat(purchase?.getAttribute('x') ?? '0')).toBeLessThanOrEqual(100)
    expect(
      Number.parseFloat(purchase?.getAttribute('x') ?? '0') +
        Number.parseFloat(purchase?.getAttribute('width') ?? '0'),
    ).toBeLessThanOrEqual(100)
    const high = screen.getByText('70%', { exact: true })
    expect(high.element().className).toContain('text-warning')
  })
})
